<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:fo="http://www.w3.org/1999/XSL/Format"
    xmlns:mei="http://www.music-encoding.org/ns/mei"
    xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions"
    xmlns:edirom="http://www.edirom.de"
    exclude-result-prefixes="xs xd fo mei edirom"
    xml:space="default"
    version="2.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Mar 14, 2012</xd:p>
            <xd:p><xd:b>Author:</xd:b> bwb</xd:p>
            <xd:p>Stylesheet for transforming Edirom MEI 2012 sources to HTML</xd:p>
        </xd:desc>
    </xd:doc>
    
    <xsl:output encoding="UTF-8" media-type="text/xml" method="xml" omit-xml-declaration="no" indent="yes"/>
 
<!-- PARAMs ============================================================ -->
    
    <xsl:include href="edirom_params.xsl"/>
    <xsl:param name="facsBasePath" select="string('')"/>
    
<!-- VARIABLEs ============================================================ -->
    
    <xsl:variable name="langFile">
        <xsl:choose>
            <xsl:when test="doc-available(concat($base, 'i18n/{$lang}.xml'))">
                <xsl:copy-of select="document(concat($base, 'i18n/{$lang}.xml'))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy-of select="document(concat($base, 'i18n/en.xml'))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    
    <xsl:variable name="partMeasuresBySurface">
        <xsl:for-each select="//mei:mdiv">
            <div class="partMeasureSurfaceTabel">
                <h3><xsl:value-of select="@n | @label"><!-- TODO: welches ist der richtige Wert? --></xsl:value-of></h3>
                <xsl:for-each-group select=".//mei:measure" group-by=".//id(if(contains(@facs, '#'))then(substring-after(@facs, '#'))else(./@facs))/parent::mei:surface/@xml:id">
                    <dl>
                        <dt><xsl:value-of select="current-group()[1]/@n|current-group()[last()]/@n" separator="–"></xsl:value-of></dt>
                        <dd><a href="{concat('#', current-grouping-key())}"><xsl:value-of select="current-grouping-key()"></xsl:value-of></a></dd>
                    </dl>
                </xsl:for-each-group>
            </div>
        </xsl:for-each>
    </xsl:variable>
    <xsl:variable name="measuersBySurface">
        <xsl:for-each-group select=".//mei:measure" group-by=".//id(if(contains(@facs, '#'))then(substring-after(@facs, '#'))else(./@facs))/parent::mei:surface/@xml:id">
            <eof:facs id ="{current-grouping-key()}">
                <xsl:for-each select="current-group()">
                    <xsl:copy-of select="."/>
                </xsl:for-each>
            </eof:facs>
        </xsl:for-each-group>
    </xsl:variable>
    
<!-- FUNCTIONs ============================================================ -->

    <xsl:include href="ediromOnline_functions.xsl"/>
    
    <xsl:function name="eof:getBarRangeStatement">
        <xsl:param name="measures"/>
        <xsl:param name="divider"/>
        <xsl:value-of select="concat($measures[1]/@n,$divider,$measures[last()]/@n)"/>
    </xsl:function>
    
<!-- ATTRIBUTE-SETs ============================================================ -->
    
    <xsl:attribute-set name="h1">
        <xsl:attribute name="font-weight">bold</xsl:attribute>
    </xsl:attribute-set>

<!-- TEMPLATEs ============================================================ -->
    
    <xsl:template match="/">
        <html>
            <head>
                <title>Print Preview <xsl:value-of select="//mei:source/mei:identifier | //mei:source/mei:titleStmt/mei:title[1]" separator=", "/></title>
                <link media="screen" href="{concat($ediromOnlineRoot,'/resources/css/printPreview/screen.css')}" type="text/css" rel="stylesheet"/>
                <link media="print" href="{concat($ediromOnlineRoot,'/resources/css/printPreview/print.css')}" type="text/css" rel="stylesheet"/>
            </head>
            <body>
                <xsl:apply-templates/>
            </body>
        </html>
    </xsl:template>
    
<!-- meiHead ============================================================ -->

    <xsl:include href="meiHead2Print.xsl"/>

<!-- facsimile ============================================================ -->
    <xsl:template match="mei:facsimile">
        <div id="facsimile">
            <div class="print-region-body">
                <h1>Facsimile</h1>
                <div>
                    <h2>Struktur</h2>
<!--                    <xsl:copy-of select="$partMeasuresBySurface"></xsl:copy-of>-->
                    <xsl:for-each select="//mei:mdiv">
                        <div class="property">
                            <span class="key"><xsl:value-of select="@label"/></span>
                            <span class="value"><xsl:value-of select="count(.//mei:measure)"/><xsl:text> </xsl:text><xsl:value-of select="eof:getLabel('measures')"/></span>
                        </div>
                    </xsl:for-each>
                </div>
            </div>
        </div>
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="mei:surface">
        <div class="facsimile" id="{@xml:id}">
            <div class="static-before">
                <span><xsl:value-of select="//mei:titleStmt/*[data(.) != '']" separator=", "/></span>
                <span><xsl:value-of select="//mei:respStmt"/></span>
                <span class="header_right">Facsimile-ID: <xsl:value-of select="@xml:id"/></span>
            </div>
            <div class="print-region-body">
                <xsl:apply-templates select="mei:graphic[@type = 'facsimile']"/>
                <div>
                    <xsl:element name="h3" use-attribute-sets="h1"><xsl:value-of select="eof:getLabel('pageDetails')"/></xsl:element>
                    <div class="property">
                        <span class="key"><xsl:value-of select="eof:getLabel('page')"/><xsl:value-of select="$pListKeyDelim"/></span>
                        <span class="value"><xsl:value-of select="@n"/></span>
                    </div>
                    <div class="property">
                        <span class="key"><xsl:value-of select="eof:getLabel('movement')"/><xsl:value-of select="$pListKeyDelim"/></span>
                        <span class="value"><xsl:value-of select="@n"/></span>
                    </div>
                    <div class="property">
                        <span class="key"><xsl:value-of select="eof:getLabel('measure(s)')"/><xsl:value-of select="$pListKeyDelim"/></span>
                        <span class="value"><xsl:value-of select="eof:getBarRangeStatement($measuersBySurface/eof:facs[@id = current()/@xml:id]/mei:measure,'–')"/></span>
                    </div>
                </div>
            </div>
        </div>
    </xsl:template>
    
    <xsl:template match="mei:graphic"/>
    
    <xsl:template match="mei:graphic[@type = 'facsimile']">
        <img  src="{concat($facsBasePath,'?fn=', encode-for-uri(@target), $facsImgParas)}"/>
    </xsl:template>
    
    <xsl:template match="mei:zone"/>
    

<!-- body ============================================================ -->
    <xsl:template match="mei:body"/>
    
<!-- default templates ============================================================ -->
        <xsl:template match="text()">
            <xsl:analyze-string select="." regex="\n">
                <xsl:matching-substring> </xsl:matching-substring>
                <xsl:non-matching-substring>
                    <xsl:value-of select="."></xsl:value-of>
                </xsl:non-matching-substring>
            </xsl:analyze-string>
        </xsl:template>
    
</xsl:stylesheet>