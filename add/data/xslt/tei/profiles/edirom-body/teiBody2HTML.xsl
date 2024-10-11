<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:exist="http://exist.sourceforge.net/NS/exist" xmlns:functx="http://www.functx.com"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    exclude-result-prefixes="#default xs tei xhtml" version="2.0">
    <xsl:import href="https://raw.githubusercontent.com/transpect/xslt-util/master/functx/xsl/functx.xsl"/>
    <xsl:import href="../../Stylesheets/common/common.xsl"/>
    <xsl:import href="../../Stylesheets/html/html.xsl"/>
    <xsl:output encoding="UTF-8" media-type="text/xhmtl" method="xhtml" omit-xml-declaration="yes" indent="yes" xml:space="preserve"/>
    <xsl:param name="lang">en</xsl:param>
    <xsl:param name="base"  select="'../../../'" as="xs:string"/>
    <xsl:param name="docUri" as="xs:anyURI"/>
    <xsl:param name="contextPath" as="xs:string"/>
    <!-- OVERWRITE FOLLOWING TEI-PARAMS -->
    <!-- END OVERWRITE TEI-PARAMS -->
    <!-- FREIDI PARAMETER -->
    <xsl:param name="textType"/>
    <!-- END FREIDI PARAMETER -->
    <xsl:variable name="masterFile" select="string('file')"/>
    <!-- LEGACY TEI PARAM -->
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl" class="misc" type="string">
        <desc>
            <p>Character separating values in a rend attribute.</p>
            <p>Some projects use multiple values in <tt
                xmlns="http://www.w3.org/1999/xhtml">rend</tt>
                attributes. These are handled, but the separator character(s)
                must be specified.</p>
        </desc>
    </doc>
    <xsl:param name="rendSeparator">; </xsl:param>
    <!-- / LEGACY TEI PARAM -->
    
    <xd:doc scope="component">
        <xd:desc>The language variable for the Edirom Online language file.</xd:desc>
    </xd:doc>
    <xsl:variable name="language">
        <xsl:choose>
            <xsl:when test="doc-available(concat($base, 'i18n/{$lang}.xml'))">
                <xsl:copy-of select="document(concat($base, 'i18n/{$lang}.xml'))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy-of select="document(concat($base, 'i18n/en.xml'))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    
    <xd:doc scope="component">
        <xd:desc>Get a label text from the Edirom or edition-specific language files.</xd:desc>
        <xd:param name="key">The key to lookup in the language file.</xd:param>
    </xd:doc>
    <xsl:function name="tei:getLabel" xpath-default-namespace="">
        <xsl:param name="key"/>
        <xsl:choose>
            <xsl:when test="$language/id($key) and not($language/id($key)/text() eq '')">
                <xsl:value-of select="$language/id($key)/text()"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$key"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <!-- OLD EDIROM OVERRIDES -->
    <!-- TODO: check if still needed -->
    <!-- 
        maybe this is not needed any more and was for the header transformation.
        potential solution iv override still needed
        capture Edirom specific cases and default to:
        <xsl:next-match>
            <xsl:with-param name="level" select="$level"/>
            <xsl:with-param name="heading" select="if (tei:getLabel(local-name($element)) != '') then tei:getLabel(local-name($element)) else if ($heading != '') then $heading else local-name($element)"/>
            <xsl:with-param name="implicitBlock" select="$implicitBlock"/>
        </xsl:next-match>
    -->
    <xd:doc>
        <xd:desc>Section-like object</xd:desc>
    </xd:doc>
    <xsl:template name="makeSection">
        <xsl:param name="element"/>
        <xsl:param name="level"/>
        <xsl:param name="heading"/>
        <xsl:param name="implicitBlock"/>
        <xsl:element name="div">
            <xsl:attribute name="class" select="string('section')"/>
            <xsl:element name="h{$level}">
                <xsl:value-of select="if (tei:getLabel(local-name($element)) != '') then tei:getLabel(local-name($element)) else if ($heading != '') then $heading else local-name($element)"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('propertyList')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] display graphic file</desc>
    </doc>
    <xsl:template name="showGraphic">
        <!-- Edirom Online specific cutomization -->
        <!-- TODO check if all these cases reolve properly
        
            <xsl:choose>
                <xsl:when test="starts-with(@url, 'http://')">
                    <xsl:value-of select="@url"/>
                </xsl:when>
                <xsl:when test="starts-with(@url, '/exist/')">
                    <xsl:value-of select="@url"/>
                </xsl:when>
                <xsl:when test="starts-with(@url, '../')">
                    <xsl:variable name="folder-ups" select="functx:number-of-matches(@url, '../')"/>
                    <xsl:variable name="unprefixedDocUri" select="substring-after($docUri, 'xmldb:exist:///db/')"/>
                    <xsl:variable name="uri-tokens" select="tokenize($unprefixedDocUri, '/')" as="xs:string*"/>
<!-/-                    <xsl:value-of select="string-join(($uri-tokens[position() lt last() - $folder-ups]), '/') || functx:substring-after-last-match(@url, '../')"/>-/->
                    <xsl:value-of select="string-join(($contextPath, $uri-tokens[position() lt last() - $folder-ups + 1], functx:substring-after-last-match(@url, '\.\./')), '/')"/>
                </xsl:when>
                <xsl:when test="@url != ''">
                    <xsl:value-of select="@url"/>
                    <!-/-<xsl:value-of select="concat($graphicsPrefix, @url)"/>
                    <xsl:if test="not(contains(@url,'.'))">
                        <xsl:value-of select="$graphicsSuffix"/>
                    </xsl:if>
                    <xsl:text>?</xsl:text>
                    <xsl:for-each-group group-by="parent::node()" select="@width | @height | @scale"><!-\- | @scale -\->
                        <xsl:for-each select="current-group()">
                            <xsl:choose>
                                <xsl:when test="name() = 'height'">
                                    <xsl:value-of select="concat('dh=', tei:calcDimension(.), '&amp;', 'amp;')"/>
                                </xsl:when>
                                <xsl:when test="name() = 'width'">
                                    <xsl:value-of select="concat('dw=', tei:calcDimension(.), '&amp;', 'amp;')"/>
                                </xsl:when>
<!-\-                            <xsl:when test="name() = 'scale'">
                                    <xsl:value-of select="concat('dh=', tei:calcDimension(.), '&', 'amp;')"/>
                                </xsl:when>-\->
                                <xsl:otherwise/>
                            </xsl:choose>
                        </xsl:for-each>
                    </xsl:for-each-group>
                    <xsl:if test="not(@width | @height | @scale)">
                        <xsl:value-of select="concat('dw=350', '&amp;', 'amp;')"/>
                    </xsl:if>
                    <xsl:text>mo=fit</xsl:text>-/->
                </xsl:when>
                <xsl:when test="@url = ''">error<xsl:value-of select="$graphicsSuffix"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:message terminate="yes">Cannot work out how to do a graphic
                    </xsl:message>
                </xsl:otherwise>
            </xsl:choose>
        -->
        
        <!-- 
            The variable `$graphicsPrefix` is to distinguish images (referenced from a TEI file) that are 
            a) to be fetched from a remote location (via http or https) or 
            b) from the current EOL instance
            
            In the case of a) `$graphicsPrefix` will be the empty-sequence
            In the case of b) `$graphicsPrefix` will hold a string with the computed URL of the image
        -->
        <xsl:variable name="graphicsPrefix" as="xs:string?">
            <xsl:choose>
                <xsl:when test="starts-with(@url, 'http')">
                    <!-- url starts with http i.e. points to a web accessible location -->
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$contextPath || '/' || substring-after(functx:substring-before-last($docUri, '/'), 'xmldb:exist:///db/') || '/'"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <!-- /Edirom Online specific cutomization -->
        <xsl:variable name="File">
            <xsl:choose>
                <xsl:when test="self::tei:binaryObject"/>
                <xsl:when test="@url">
                    <xsl:sequence select="tei:resolveURI(.,@url)"/>
                    <xsl:if test="not(contains(@url,'.'))">
                        <xsl:value-of select="$graphicsSuffix"/>
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:message>Found binaryObject without @url.</xsl:message>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="Alt">
            <xsl:choose>
                <xsl:when test="tei:desc">
                    <xsl:for-each select="tei:desc">
                        <xsl:apply-templates mode="plain"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="tei:figDesc">
                    <xsl:for-each select="tei:figDesc">
                        <xsl:apply-templates mode="plain"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="tei:head">
                    <xsl:value-of select="tei:head/text()"/>
                </xsl:when>
                <xsl:when test="parent::tei:figure/tei:figDesc">
                    <xsl:for-each select="parent::tei:figure/tei:figDesc">
                        <xsl:apply-templates mode="plain"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="parent::tei:figure/tei:head">
                    <xsl:value-of select="parent::tei:figure/tei:head/text()"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$showFigures='true'">
                <xsl:choose>
                    <xsl:when test="@type='thumbnail'"/>
                    <xsl:when test="starts-with(@mimeType, 'video')">
                        <video src="{$graphicsPrefix}{$File}"
                            controls="controls">
                            <xsl:if test="../tei:graphic[@type='thumbnail']">
                                <xsl:attribute name="poster">
                                    <xsl:value-of select="../tei:graphic[@type='thumbnail']/@url"/>
                                </xsl:attribute>
                            </xsl:if>
                        </video>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:variable name="sizes">
                            <xsl:if test="@width">
                                <xsl:text> width:</xsl:text>
                                <xsl:value-of select="@width"/>
                                <xsl:text>;</xsl:text>
                            </xsl:if>
                            <xsl:if test="@height">
                                <xsl:text> height:</xsl:text>
                                <xsl:value-of select="@height"/>
                                <xsl:text>;</xsl:text>
                            </xsl:if>
                        </xsl:variable>
                        <xsl:variable name="i">
                            <img>
                                <xsl:attribute name="src">
                                    <xsl:choose>
                                        <xsl:when test="self::tei:binaryObject">
                                            <xsl:variable name="mime" select="if (@mimeType) then @mimeType else 'image/*'"/>
                                            <xsl:variable name="enc" select="if (@encoding) then @encoding else 'base64'"/>
                                            <xsl:value-of select="concat('data:', $mime, ';', $enc, ',', normalize-space(text()))"/>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:value-of
                                                select="concat($graphicsPrefix,$File)"/>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </xsl:attribute>
                                <xsl:attribute name="alt">
                                    <xsl:value-of select="$Alt"/>
                                </xsl:attribute>
                                <xsl:call-template name="imgHook"/>
                                <xsl:if test="@xml:id">
                                    <xsl:attribute name="id">
                                        <xsl:value-of select="@xml:id"/>
                                    </xsl:attribute>
                                </xsl:if>
                                <xsl:call-template name="makeRendition"/>
                            </img>
                        </xsl:variable>
                        <xsl:for-each select="$i/*">
                            <xsl:copy>
                                <xsl:copy-of select="@*[not(name()='style')]"/>
                                <xsl:choose>
                                    <xsl:when test="$sizes=''">
                                        <xsl:copy-of select="@style"/>
                                    </xsl:when>
                                    <xsl:when test="not(@style)">
                                        <xsl:attribute name="style" select="$sizes"/>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:attribute name="style"
                                            select="concat(@style,';' ,$sizes)"/>
                                    </xsl:otherwise>
                                </xsl:choose>
                            </xsl:copy>
                        </xsl:for-each>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <div class="altfigure">
                    <xsl:sequence select="tei:i18n('figureWord')"/>
                    <xsl:text> </xsl:text>
                    <xsl:for-each select="self::tei:figure|parent::tei:figure">
                        <xsl:number count="tei:figure[tei:head]" level="any"/>
                    </xsl:for-each>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="$File"/>
                    <xsl:text> [</xsl:text>
                    <xsl:value-of select="$Alt"/>
                    <xsl:text>] </xsl:text>
                </div>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>Override template for tei:ref if link target starts with xmldb:exist://</xd:desc>
    </xd:doc>
    <xsl:template match="tei:ref">
        <xsl:param name="class" select="'link_' || local-name(.)"/>
        <xsl:choose>
            <xsl:when test="starts-with(@target, 'xmldb:exist://')">
                <a>
                    <xsl:choose>
                        <xsl:when test="matches(@target, '\[.*\]')">
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink('</xsl:text>
                                <xsl:value-of select="replace(@target, '\[.*\]', '')"/>
                                <xsl:text>', {</xsl:text>
                                <xsl:value-of select="replace(substring-before(substring-after(@target, '['), ']'), '=', ':')"/>
                                <xsl:text>}); return false;</xsl:text>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink("</xsl:text>
                                <xsl:value-of select="@target"/>
                                <xsl:text>"); return false;</xsl:text>
                            </xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:attribute name="href" select="@target"/>
                    <xsl:if test="@xml:id">
                        <xsl:copy-of select="@xml:id"/>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="@rend">
                            <xsl:attribute name="class">
                                <xsl:value-of select="@rend"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:when test="@rendition">
                            <xsl:call-template name="applyRendition"/>
                        </xsl:when>
                        <xsl:when test="parent::tei:item/parent::tei:list[@rend]">
                            <xsl:attribute name="class">
                                <xsl:value-of select="parent::tei:item/parent::tei:list/@rend"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:when test="parent::tei:item[@rend]">
                            <xsl:attribute name="class">
                                <xsl:value-of select="parent::tei:item/@rend"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="class">
                                <xsl:value-of select="$class"/>
                            </xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:if test="@type">
                        <xsl:attribute name="type">
                            <xsl:value-of select="@type"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="@n">
                            <xsl:attribute name="title">
                                <xsl:value-of select="@n"/>
                            </xsl:attribute>
                        </xsl:when>
                    </xsl:choose>
                    <xsl:call-template name="xrefHook"/>
                    <xsl:apply-templates/>
                </a>
            </xsl:when>
            <xsl:otherwise>
                <xsl:next-match />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:abbr">
        <xsl:element name="span">
            <xsl:attribute name="class">abbr</xsl:attribute>
            <xsl:attribute name="title">
                <xsl:value-of select="."/>
            </xsl:attribute>
            <xsl:apply-templates select="text()"/>
        </xsl:element>
    </xsl:template>
    
    <xd:doc>
        <xd:desc>Mark exist:match KWIC result with span</xd:desc>
    </xd:doc>
    <xsl:template match="exist:match">
        <span class="searchResult">
            <xsl:apply-templates/>
        </span>
    </xsl:template>
    
    <xsl:template match="tei:pb" priority="5">
        <xsl:variable name="page_folio">
            <xsl:choose>
                <xsl:when test="matches(@n, '\d+[a-z]?(r|v)')"> fol. </xsl:when>
                <xsl:when test="@n"> pag. </xsl:when>
            <xsl:otherwise/>
            </xsl:choose>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$filePerPage='true'">
                <PAGEBREAK>
                    <xsl:attribute name="name">
                        <xsl:apply-templates select="." mode="ident"/>
                    </xsl:attribute>
                    <xsl:copy-of select="@facs"/>
                </PAGEBREAK>
            </xsl:when>
            <xsl:when test="@facs and not(@rend='none') and not(@rend='-')">
                <xsl:variable name="IMG">
                    <xsl:choose>
                        <xsl:when test="starts-with(@facs,'#')">
                            <xsl:for-each select="id(substring(@facs,2))">
                                <xsl:value-of select="tei:graphic[1]/@url"/>
                            </xsl:for-each>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="@facs"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:element name="{if (tei:isInline(..)) then 'span' else 'div'}">
                    <xsl:call-template name="rendToClass"/>
                    <img src="{$IMG}" alt="page image"/>
                </xsl:element>
            </xsl:when>
            <xsl:when test="$pagebreakStyle='active'">
                <div class="pagebreak">
                    <xsl:call-template name="rendToClass"/>
                </div>
            </xsl:when>
            <xsl:when
                test="$pagebreakStyle='visible' and (parent::tei:body         or parent::tei:front or parent::tei:back or parent::tei:group)">
                <xsl:if test="@rend='-'">
                    <span class="hyphen">
                        <xsl:text>-</xsl:text>
                    </span>
                </xsl:if>
                <div class="pagebreak">
                    <xsl:call-template name="makeAnchor"/>
                    <xsl:value-of select="concat(' ', $page_folio, ' ')"/>
                    <xsl:if test="@n">
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="@n"/>
                    </xsl:if>
                </div>
            <br class="pb"/>
            </xsl:when>
            <xsl:when test="$pagebreakStyle='visible'">
                <xsl:variable name="classValue">
                    <xsl:if test="local-name(..) = ('hi', 'p', 'del', 'stage')">inner</xsl:if>
                </xsl:variable>
                <xsl:if test="@rend='-' and preceding-sibling::text()">
                    <span class="hyphen">
                        <xsl:text>-</xsl:text>
                    </span>
                </xsl:if>
                <xsl:if test="local-name(..) = ('hi', 'p', 'del', 'stage')">
                    <br/>
                </xsl:if>
                <span class="pagebreak {$classValue}">
                    <xsl:call-template name="makeAnchor"/>
                    <xsl:value-of select="concat(' ', $page_folio, ' ')"/>
                    <xsl:if test="@n">
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="@n"/>
                    </xsl:if>
                </span>
            <br class="pb"/>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:sp" priority="5">
        <div class="speaker">
            <xsl:call-template name="makeAnchor"/>
            <xsl:apply-templates select="tei:speaker"/>
            <xsl:if test="tei:speaker/following-sibling::*[1][@rend = 'inline']">
                    &#160;<xsl:apply-templates
                    select="tei:speaker/following-sibling::tei:stage[@rend = 'inline'][1]"
                /></xsl:if>
        </div>
        <xsl:apply-templates
            select="tei:*[not(self::tei:speaker) and not(self::tei:stage[@rend = 'inline'][1])]"/>
    </xsl:template>
    <xsl:template match="tei:del" priority="5">
        <xsl:element name="{if (*[not(tei:isInline(.))]) then 'div' else 'span' }">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">del</xsl:with-param>
            </xsl:call-template>
            <xsl:if test="@hand">
                <xsl:attribute name="data-eo-hand" select="@hand"/>
            </xsl:if>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:lb" priority="5">
        <xsl:choose>
            <xsl:when test="parent::tei:body"/>
            <xsl:when test="parent::tei:back"/>
            <xsl:when test="parent::tei:front"/>
            <xsl:when test="parent::tei:p and count(./preceding-sibling::node()) = 0"/>
            <xsl:when
                test="./following-sibling::element()[1][local-name(.) = 'stage' and not(contains(./@rend, 'inline'))]"/>
            <xsl:when test="@type='hyphenInWord' and @rend='hidden'"/>
            <xsl:when test="@type='indent' and @rend='-'">
                <span class="hyphen">
                    <xsl:text>-</xsl:text>
                </span>
                <br/>
                <span class="lb_indent">&#160;</span>
            </xsl:when>
            <xsl:when test="@type='indent'">
                <br/>
                <span class="lb_indent">&#160;</span>
            </xsl:when>
            <xsl:when test="@rend='hidden'">
                <xsl:text> </xsl:text>
            </xsl:when>
            <xsl:when test="@rend='-' or @type='hyphenInWord'">
                <span class="hyphen">
                    <xsl:text>-</xsl:text>
                </span>
                <br/>
            </xsl:when>
            <xsl:when test="@rend='above'">
                <xsl:text>⌜</xsl:text>
            </xsl:when>
            <xsl:when test="@rend='below'">
                <xsl:text>⌞</xsl:text>
            </xsl:when>
            <xsl:when test="@rend">
                <br class="{@rend}"/>
            </xsl:when>
            <xsl:otherwise>
                <br/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>Process element l</desc>
    </doc>
    <xsl:template match="tei:l" priority="5">
        <xsl:variable name="inlineStage"
            select="exists(./following-sibling::*[1][@rend = 'inline'])" as="xs:boolean"/>
        <xsl:element name="{if (ancestor::tei:head or ancestor::tei:hi) then 'span' else 'div'}">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">l</xsl:with-param>
            </xsl:call-template>
            <xsl:choose>
                <xsl:when test="ancestor::tei:div[contains(@rend,'linenumber')]">
                    <xsl:variable name="n">
                        <xsl:number/>
                    </xsl:variable>
                    <div class="numbering">
                        <xsl:choose>
                            <xsl:when test="$n mod 5 = 0">
                                <xsl:value-of select="$n"/>
                            </xsl:when>
                            <xsl:otherwise>&#160;</xsl:otherwise>
                        </xsl:choose>
                    </div>
                    <xsl:apply-templates/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates/>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:if test="$inlineStage"> &#160;<xsl:apply-templates
                    select="./following-sibling::tei:stage[@rend = 'inline'][1]"/></xsl:if>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:l[@part = 'F']" priority="6">
        <xsl:variable name="init" select="preceding::tei:l[@part = 'I'][1]"/>
        <xsl:element name="{if (ancestor::tei:head or ancestor::tei:hi) then 'span' else 'div'}">
            <xsl:attribute name="style"
                select="concat('padding-left: ', (string-length(normalize-space(string-join($init/text() | $init//*[not(./ancestor-or-self::tei:stage)]/text(), ''))) * 0.45), 'em;')"/>
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">l</xsl:with-param>
            </xsl:call-template>
            <xsl:choose>
                <xsl:when test="ancestor::tei:div[contains(@rend,'linenumber')]">
                    <xsl:variable name="n">
                        <xsl:number/>
                    </xsl:variable>
                    <div class="numbering">
                        <xsl:choose>
                            <xsl:when test="$n mod 5 = 0">
                                <xsl:value-of select="$n"/>
                            </xsl:when>
                            <xsl:otherwise>&#160;</xsl:otherwise>
                        </xsl:choose>
                    </div>
                    <xsl:apply-templates/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:stage" priority="5">
        <xsl:element
            name="{if (*[not(tei:isInline(.))]) then 'div' else 'span' }">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">
                    <xsl:choose>
                        <xsl:when test="@type = 'setting'">
                            <xsl:choose>
                                <xsl:when test="ancestor::tei:text/@rend='firstfolio'">setting stage</xsl:when>
                                <xsl:when test="ancestor::tei:*/@rend='inline' or ancestor::tei:*/@place='inline'">setting stage it inline</xsl:when>
                                <xsl:otherwise>setting stage it</xsl:otherwise>
                            </xsl:choose>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:choose>
                                <xsl:when test="ancestor::tei:text/@rend='firstfolio'">stage</xsl:when>
                                <xsl:when test="ancestor::tei:*/@rend='inline' or ancestor::tei:*/@place='inline'">stage it inline</xsl:when>
                                <xsl:otherwise>stage it</xsl:otherwise>
                            </xsl:choose>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:with-param>
            </xsl:call-template>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:add" priority="5">
        <xsl:element
            name="{if (*[not(tei:isInline(.))]) then 'div' else 'span' }">
            <xsl:if test="./parent::tei:subst and @place='above'">
                <xsl:variable name="del" select="preceding-sibling::tei:del"/>
                <xsl:variable name="delLines" select="count($del//tei:lb)"/>
                <xsl:variable name="firstLine"
                    select="if($delLines gt 0) then(normalize-space(string-join($del//tei:lb/preceding-sibling::node()//text(),''))) else(normalize-space(string-join($del//text(),'')))"/>
                <xsl:variable name="offset" select="string-length($firstLine) * 0.45"/>
                <xsl:attribute name="style"
                    select="concat('margin-left:-',$offset,'em; margin-top:-',$delLines * 2,'em;')"
                />
            </xsl:if>
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">
                    <xsl:choose>
                        <xsl:when test="@place = 'above'">add above</xsl:when>
                        <xsl:when test="@place = 'inline'">add inline</xsl:when>
                        <xsl:otherwise>add</xsl:otherwise>
                    </xsl:choose>
                </xsl:with-param>
            </xsl:call-template>
            <xsl:if test="@hand">
                <xsl:attribute name="data-eo-hand" select="@hand"/>
            </xsl:if>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:subst" priority="5">
        <xsl:element
            name="{if (*[not(tei:isInline(.))]) then 'div' else 'span' }">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default"> subst </xsl:with-param>
            </xsl:call-template>
            <xsl:if test="@hand">
                <xsl:attribute name="data-eo-hand" select="@hand"/>
            </xsl:if>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:text" priority="5">
        <xsl:choose>
            <xsl:when test="parent::tei:TEI">
                <div>
                    <xsl:variable name="class" as="xs:string*">
                        <xsl:value-of select="$textType"/>
                        <xsl:if test="parent::tei:TEI/@xml:id">
                            <xsl:value-of select="parent::tei:TEI/string(@xml:id)"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:attribute name="class" select="string-join($class, ' ')"/>
                    <xsl:apply-templates/>
                </div>
            </xsl:when>
            <xsl:when test="ancestor::tei:group and $splitLevel=0">
                <xsl:call-template name="makeDivPage">
                    <xsl:with-param name="depth">-1</xsl:with-param>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="makeDivBody"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:titlePart[@type='main']" priority="5">
        <div class="titlePart main">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="tei:sic" priority="5">
        <xsl:apply-templates/>
        <xsl:if test="not(following-sibling::tei:corr)">
            <span class="sic">
                <xsl:text>[sic]</xsl:text>
            </span>
        </xsl:if>
    </xsl:template>
    <xsl:template match="tei:corr" priority="5">
        <span class="corr begin">
            <xsl:text> [recte:</xsl:text>
        </span>
        <xsl:apply-templates/>
        <span class="corr end">
            <xsl:text>]</xsl:text>
        </span>
    </xsl:template>
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] <param name="value">the current segment of the value of the rend
                attribute</param><param name="rest">the remainder of the attribute</param> modified
            2014-04-28 in order to include 'spaced_out' in template for 'expanded'; removed @style;
            added @class='expanded' </desc>
    </doc>
    <xsl:template name="renderingInner">
        <xsl:param name="value"/>
        <xsl:param name="rest"/>
        <xsl:choose>
            <xsl:when test="$value='bold' or $value='bo'">
                <b>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </b>
            </xsl:when>
            <xsl:when test="$value='center'">
                <center>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </center>
            </xsl:when>
            <xsl:when test="$value='code'">
                <b>
                    <tt>
                        <xsl:call-template name="applyRend">
                            <xsl:with-param name="value" select="$rest"/>
                        </xsl:call-template>
                    </tt>
                </b>
            </xsl:when>
            <xsl:when
                test="$value='italics' or $value='italic' or $value='cursive' or         $value='it' or $value='ital'">
                <i>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </i>
            </xsl:when>
            <xsl:when test="$value='ro' or $value='roman'">
                <span style="font-style: normal">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='sc' or $value='smcap'">
                <span style="font-variant: small-caps">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='plain'">
                <xsl:call-template name="applyRend">
                    <xsl:with-param name="value" select="$rest"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:when test="$value='quoted'">
                <xsl:text>‘</xsl:text>
                <xsl:call-template name="applyRend">
                    <xsl:with-param name="value" select="$rest"/>
                </xsl:call-template>
                <xsl:text>’</xsl:text>
            </xsl:when>
            <xsl:when test="$value='sub'">
                <sub>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </sub>
            </xsl:when>
            <xsl:when test="$value='sup'">
                <sup>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </sup>
            </xsl:when>
            <xsl:when test="$value='important'">
                <span class="important">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='ul'">
                <u>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </u>
            </xsl:when>
            <xsl:when test="$value='interlinMarks'">
                <xsl:text>`</xsl:text>
                <xsl:call-template name="applyRend">
                    <xsl:with-param name="value" select="$rest"/>
                </xsl:call-template>
                <xsl:text>´</xsl:text>
            </xsl:when>
            <xsl:when test="$value='overbar'">
                <span style="text-decoration:overline">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='expanded' or $value='spaced_out'">
                <span class="expanded">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='strike'">
                <span style="text-decoration: line-through">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='small'">
                <span style="font-size: 75%">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='large'">
                <span style="font-size: 150%">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='smaller'">
                <span style="font-size: 50%">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='larger'">
                <span style="font-size: 200%">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='calligraphic' or $value='cursive'">
                <span style="font-family: cursive">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='gothic'">
                <span style="font-family: Papyrus, fantasy">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='noindex'">
                <xsl:call-template name="applyRend">
                    <xsl:with-param name="value" select="$rest"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="local-name(.)='p'">
                        <xsl:call-template name="unknownRendBlock">
                            <xsl:with-param name="rest" select="$rest"/>
                            <xsl:with-param name="value" select="$value"/>
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="unknownRendInline">
                            <xsl:with-param name="rest" select="$rest"/>
                            <xsl:with-param name="value" select="$value"/>
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
<doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>Process element name in mode "plain"</desc>
    </doc>
    <xsl:template match="tei:name" priority="5">
        <span class="name">
            <xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="tei:*[@rend = 'underline' and @n = '2']" priority="6">
        
        <xsl:variable name="default">
            <xsl:next-match/>
        </xsl:variable>
        <xsl:element name="{$default/node()/local-name()}">
            <xsl:attribute name="class" select="concat($default/node()/@class, ' n2')"/>
            <xsl:for-each select="$default/node()/node() | $default/node()/@* except $default/node()/@class">
                <xsl:copy-of select="."/>
            </xsl:for-each>
        </xsl:element>
    </xsl:template>
<xsl:template match="tei:ref[starts-with(@target, '#footnote')]" priority="5">
        <xsl:variable name="footnote_id" select="substring(./@target, 2)" as="xs:string"/>
        
        <xsl:choose>
            <xsl:when test="count(//tei:note[@xml:id=$footnote_id]/*) &gt; 0">
                <span class="footnote tipped" data-tipped-options="inline: '{$footnote_id}_tipped'">
                    <xsl:apply-templates/>
                </span>
                <div id="{$footnote_id}_tipped" style="display: none;">
                    <xsl:apply-templates select="//tei:note[@xml:id=$footnote_id]"/>
                </div>
            </xsl:when>
            <xsl:when test="exists(//tei:note[@xml:id=$footnote_id])">
                <span class="footnote scrollto" data-footnote="{$footnote_id}">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="footnote">
                    <xsl:apply-templates/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="tei:milestone">
        <xsl:variable name="className" as="xs:string*">
            <xsl:for-each select="@* except @xml:id">
                <xsl:value-of select="concat(local-name(.), '_', string(.))"/>
            </xsl:for-each>
        </xsl:variable>
        <a class="{string-join($className, ' ')}" id="{./string(@xml:id)}"><!-- anchor --></a>
    </xsl:template>
    
    <xsl:template match="tei:supplied">
        <xsl:text>[</xsl:text><xsl:apply-templates/><xsl:text>]</xsl:text>
    </xsl:template>
    <xsl:template match="tei:note[@type='commentary']">
        <xsl:variable name="no" select="count(./preceding::tei:note[@type='commentary'])"/>
        <!-- für Einzelkommentare -->
        <!--<div class="note_K tipped" data-tipped-options="inline: 'tip{$no}'" style="float:right; margin-right: 30px;">
            <i class="fa fa-comment-o fa-fw fa-lg"/>
        </div>
        <div id="tip{$no}" style="display: none;">
            <strong>Kommentar Einzelquelle</strong>
            <br/>
            <xsl:apply-templates/>
        </div>-->
        <!-- Für Kommentare im Text -->
        <span class="tipped" data-tipped-options="inline: 'tip{$no}'"><i class="fa fa-comment-o inline-comment"/></span>
        <div id="tip{$no}" style="display: none;">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>
            <xd:p>Process footnotes and endnotes</xd:p>
            <xd:p>Copied from TEI Stylesheets/html/html_core.xsl to override the creation of footnote links for Edirom Online.</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template name="footNote">
        <xsl:variable name="identifier">
            <xsl:call-template name="noteID"/>
        </xsl:variable>
        <xsl:element name="{if (tei:isInline(.)) then 'span' else 'div' }">
            <xsl:call-template name="makeAnchor">
                <xsl:with-param name="name" select="concat($identifier,'_return')"/>
            </xsl:call-template>
            <xsl:variable name="note-title">
                <xsl:variable name="note-text">
                    <xsl:apply-templates mode="plain"/>
                </xsl:variable>
                <xsl:value-of select="substring($note-text,1,150)"/>
                <xsl:if test="string-length($note-text) &gt; 150">
                    <xsl:text>…</xsl:text>
                </xsl:if>
            </xsl:variable>
            <xsl:choose>
                <xsl:when test="$footnoteFile='true'">
                    <a class="notelink" title="{normalize-space($note-title)}" href="{$masterFile}-notes.html#{$identifier}">
                        <xsl:element name="{if (tei:match(@rend,'nosup')) then 'span' else 'sup'}">
                            <xsl:call-template name="noteN"/>
                        </xsl:element>
                    </a>
                    <xsl:if test="following-sibling::node()[1][self::tei:note]">
                        <xsl:element name="{if (tei:match(@rend,'nosup')) then 'span' else 'sup'}">
                            <xsl:text>,</xsl:text>
                        </xsl:element>
                    </xsl:if>
                </xsl:when>
                <xsl:otherwise>
                    <!-- START of Edirom Online specific customization -->
                    <xsl:variable name="linkTarget" select="$docUri || '#' || $identifier"/>
                    <xsl:element name="a">
                        <xsl:attribute name="class">notelink</xsl:attribute>
                        <xsl:attribute name="href" select="$linkTarget"/>
                        <xsl:attribute name="title" select="normalize-space($note-title)"/>
                        <xsl:attribute name="onclick">
                            <xsl:text>loadLink('</xsl:text>
                            <xsl:value-of select="$linkTarget"/>
                            <xsl:text>', {useExisting:true}); return false;</xsl:text>
                        </xsl:attribute>
                        <xsl:element name="{if (@rend='nosup') then 'span' else 'sup'}">
                            <xsl:call-template name="noteN"/>
                        </xsl:element>
                    </xsl:element>
                    <!-- END of Edirom Online specific customization -->
                    <xsl:if test="following-sibling::node()[1][self::tei:note]">
                        <xsl:element name="{if (tei:match(@rend,'nosup')) then 'span' else 'sup'}">
                            <xsl:text>,</xsl:text>
                        </xsl:element>
                    </xsl:if>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:element>
    </xsl:template>
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>
            <p>Process element note</p>
            <p>copied from TEI Stylesheets/html/html_core.xsl in order to fix link target in Edirom-Online</p>
            <p>Used, e.g., for endnotes</p>
        </desc>
    </doc>
    <xsl:template name="makeaNote">
        <xsl:variable name="identifier">
            <xsl:call-template name="noteID"/>
        </xsl:variable>
        <xsl:if test="$verbose='true'">
            <xsl:message>Make note <xsl:value-of select="$identifier"/></xsl:message>
        </xsl:if>
        <div class="note">
            <xsl:call-template name="makeAnchor">
                <xsl:with-param name="name" select="$identifier"/>
            </xsl:call-template>
            <span class="noteLabel">
                <xsl:call-template name="noteN"/>
                <xsl:if test="matches(@n,'[0-9]')">
                    <xsl:text>.</xsl:text>
                </xsl:if>
                <xsl:text> </xsl:text>
            </span>
            <div class="noteBody">
                <xsl:apply-templates/>
            </div>
            <xsl:if test="$footnoteBackLink= 'true'">
                <xsl:text> </xsl:text>
                <!-- here are the Edirom Online specific modifications -->
                <xsl:element name="a">
                    <xsl:variable name="linkTarget" select="$docUri || '#' || $identifier || '_return'"/><!-- TODO: move linkTarget calculation to edirom-specific function -->
                    <xsl:attribute name="class">link_return</xsl:attribute>
                    <xsl:attribute name="href" select="$linkTarget">
                        <!-- actually not needed for functionality of Edirom Online -->
                    </xsl:attribute>
                    <xsl:attribute name="title">Go back to text</xsl:attribute><!-- TODO: use i18n -->
                    <xsl:attribute name="onclick">
                        <!-- this is where the real magic happens -->
                        <xsl:text>loadLink('</xsl:text>
                        <xsl:value-of select="$linkTarget"/>
                        <xsl:text>', {useExisting:true}); return false;</xsl:text>
                    </xsl:attribute>
                    <xsl:text>↵</xsl:text><!-- TODO: parametrize -->
                </xsl:element>
                <!-- end of the Edirom Online specific modifications -->
            </xsl:if>
        </div>
    </xsl:template>
    
    <xsl:template match="tei:quote" priority="5">
        <xsl:choose>
            <xsl:when test="parent::tei:cit[@rend = 'inline']">
                <span class="quote inline">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <div class="citquote">
                    <xsl:apply-templates/>
                </div>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="stdfooter">
        <xsl:param name="title"/>
    </xsl:template>
    <xsl:template name="stdheader">
        <xsl:param name="title"/>
    </xsl:template>
    
    <!-- / OLD EDIROM OVERRIDES -->
    
    
    <!-- SAVED OLD TEI FUNCTIONS AND TEMPLATES TO MAKE THIS WORK -->
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] Active a value for @rend<param name="value">value</param>
        </desc>
    </doc>
    <xsl:template name="applyRend">
        <!-- TODO: look for alternative in new version of Stylesheets -->
        <xsl:param name="value"/>
        <xsl:choose>
            <xsl:when test="not($value='')">
                <xsl:variable name="thisparm" select="substring-before($value,$rendSeparator)"/>
                <xsl:call-template name="renderingInner">
                    <xsl:with-param name="value" select="$thisparm"/>
                    <xsl:with-param name="rest" select="substring-after($value,$rendSeparator)"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] convert rend attribute to HTML class</desc>
    </doc>
    <xsl:template name="rendToClass">
        <!-- TODO: look for alternative in new version of Stylesheets -->
        <xsl:param name="id">true</xsl:param>
        <xsl:param name="default">.</xsl:param>
        <xsl:choose>
            <xsl:when test="$id='false'"/>
            <xsl:when test="$id=''"/>
            <xsl:when test="$id='true' and @xml:id">
                <xsl:attribute name="id">
                    <xsl:value-of select="@xml:id"/>
                </xsl:attribute>
            </xsl:when>
            <xsl:when test="$id='true' and self::tei:p and $generateParagraphIDs='true'">
                <xsl:attribute name="id">
                    <xsl:value-of select="generate-id()"/>
                </xsl:attribute>
            </xsl:when>
            <xsl:when test="$id='true'"/>
            <xsl:otherwise>
                <xsl:attribute name="id" select="$id"/>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="$outputTarget='html5'">
            <xsl:call-template name="microdata"/>
        </xsl:if>
        <xsl:variable name="class1">
            <xsl:choose>
                <xsl:when test="$default=''"/>
                <xsl:when test="not($default='.')">
                    <xsl:value-of select="$default"/>
                </xsl:when>
                <xsl:when test="@type">
                    <xsl:value-of select="@type"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="local-name()"/>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:call-template name="rendToClassHook"/>
            <xsl:if test="tei:isTranscribable(.) and $mediaoverlay='true'">
                <xsl:text> transcribable</xsl:text>
            </xsl:if>
        </xsl:variable>
        <xsl:variable name="class2">
            <xsl:choose>
                <xsl:when test="@rend">
                    <xsl:value-of select="translate(@rend,'/','-')"/>
                </xsl:when>
                <xsl:when test="@rendition">
                    <xsl:call-template name="findRendition">
                        <xsl:with-param name="value">
                            <xsl:value-of select="@rendition"/>
                        </xsl:with-param>
                    </xsl:call-template>
                </xsl:when>
                <xsl:when test="key('TAGREND',local-name())">
                    <xsl:for-each select="key('TAGREND',local-name())">
                        <xsl:call-template name="findRendition">
                            <xsl:with-param name="value">
                                <xsl:value-of select="@render"/>
                            </xsl:with-param>
                        </xsl:call-template>
                    </xsl:for-each>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$class1='' and $class2=''"/>
            <xsl:when test="$class2=''">
                <xsl:attribute name="class">
                    <xsl:value-of select="normalize-space($class1)"/>
                </xsl:attribute>
            </xsl:when>
            <xsl:otherwise>
                <xsl:attribute name="class">
                    <xsl:if test="not($class1='')">
                        <xsl:value-of select="$class1"/>
                        <xsl:text> </xsl:text>
                    </xsl:if>
                    <xsl:value-of select="$class2"/>
                </xsl:attribute>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:choose>
            <xsl:when test="@rendition">
                <xsl:call-template name="applyRendition"/>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] Activate a value for @rendition<param name="value">value</param>
        </desc>
    </doc>
    <xsl:template name="applyRendition">
        <!-- TODO: look for alternative in new version of Stylesheets -->
        <xsl:attribute name="class">
            <xsl:for-each select="tokenize(normalize-space(@rendition),' ')">
                <xsl:call-template name="findRendition">
                    <xsl:with-param name="value">
                        <xsl:value-of select="."/>
                    </xsl:with-param>
                </xsl:call-template>
            </xsl:for-each>
        </xsl:attribute>
    </xsl:template>
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] Look up rendition value <param name="value">value</param>
        </desc>
    </doc>
    <xsl:template name="findRendition">
        <!-- TODO: look for alternative in new version of Stylesheets -->
        <xsl:param name="value"/>
        <xsl:choose>
            <xsl:when test="starts-with($value,'#')">
                <xsl:value-of select="substring-after($value,'#')"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:for-each select="document($value)">
                    <xsl:apply-templates select="@xml:id"/>
                </xsl:for-each>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:text> </xsl:text>
    </xsl:template>
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] allow for local extensions to rendToClass</desc>
    </doc>
    <xsl:template name="rendToClassHook">
        <!-- TODO: do we really need this? look for alternative in new version of Stylesheets -->
    </xsl:template>
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] Process unknown rend attribute by turning it into
            an HTML class<param name="value">current value</param>
            <param name="rest">remaining values</param>
        </desc>
    </doc>
    <xsl:template name="unknownRendBlock">
        <!-- TODO: look for alternative in new version of Stylesheets -->
        <xsl:param name="value"/>
        <xsl:param name="rest"/>
        <xsl:if test="not($value='')">
            <xsl:attribute name="class">
                <xsl:value-of select="$value"/>
            </xsl:attribute>
            <xsl:call-template name="applyRend">
                <xsl:with-param name="value" select="$rest"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html]  Process unknown rend attribute by turning it into
            an HTML class<param name="value">value</param>
            <param name="rest">rest</param>
        </desc>
    </doc>
    <xsl:template name="unknownRendInline">
        <!-- TODO: look for alternative in new version of Stylesheets -->
        <xsl:param name="value"/>
        <xsl:param name="rest"/>
        <xsl:if test="not($value='')">
            <span class="{$value}">
                <xsl:call-template name="applyRend">
                    <xsl:with-param name="value" select="$rest"/>
                </xsl:call-template>
            </span>
        </xsl:if>
    </xsl:template>
    <!-- /SAVED OLD TEI TEMPLATES TO MAKE THIS WORK -->
</xsl:stylesheet>
