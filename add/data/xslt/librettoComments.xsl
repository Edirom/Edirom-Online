<xsl:stylesheet xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    exclude-result-prefixes="xs xd tei" version="3.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Apr 14, 2016</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> daniel</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    <xsl:param name="librettoCommentsFileName" as="xs:string"/>
    <xsl:variable name="librettoCommentsFile" select="document($librettoCommentsFileName)" as="node()"/>
    <xsl:variable name="doc.id" select="//tei:TEI/@xml:id" as="xs:string"/>
    
    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:variable name="elem.id" select="@xml:id" as="xs:string?"/>
        <xsl:copy>
            <xsl:apply-templates select="@* | node()"/>
        </xsl:copy>
        <xsl:if test="$elem.id">
            <xsl:for-each select="$librettoCommentsFile//tei:note[concat('#', $doc.id, '_', $elem.id) = (tokenize(@target, ' '))]">
                <xsl:copy>
                    <xsl:attribute name="freidi.type" select="'freidi.libretto.multi.comment'"/>
                    <xsl:apply-templates select="@* | node()"/>
                <tei:lb/>
                    <tei:lb/>
                    <tei:hi rend="bold">Quellen</tei:hi>
                    <tei:lb/>
                    <xsl:for-each select="for $t in tokenize(@target, ' ') return substring-before(substring-after($t, '#'), '_')">
                        <xsl:call-template name="formatSigla"/>
                        <xsl:if test="position() != last()">
                            <xsl:text>, </xsl:text>
                        </xsl:if>
                    </xsl:for-each>
                </xsl:copy>
            </xsl:for-each>
        </xsl:if>
    </xsl:template>
    
    <xsl:template name="formatSigla" as="node()*">
        <xsl:choose>
            <xsl:when test=". = 'D-tx1'">D-tx<tei:sub>1</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'D-tx2'">D-tx<tei:sub>2</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'D-tx3'">D-tx<tei:sub>3</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'KA-tx4'">K<tei:sup>A</tei:sup>-tx<tei:sub>4</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'L-tx2'">L-tx<tei:sub>2</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'K-tx6'">K-tx<tei:sub>6</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'K-tx7'">K-tx<tei:sub>7</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'KA-tx15'">K<tei:sup>A</tei:sup>-tx<tei:sub>15</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'KA-tx21'">K<tei:sup>A</tei:sup>-tx<tei:sub>21</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'ED-tx'">ED-tx</xsl:when>
            <xsl:when test=". = 'Dp-tx2'">Dp-tx<tei:sub>2</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'Dp-tx3'">Dp-tx<tei:sub>3</tei:sub>
            </xsl:when>
            <xsl:when test=". = 'VD-tx2'">VD-tx<tei:sub>2</tei:sub>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="@*">
        <xsl:copy/>
    </xsl:template>
    <xsl:template match="text()">
        <xsl:copy/>
    </xsl:template>
</xsl:stylesheet>