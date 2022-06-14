<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:mei="http://www.music-encoding.org/ns/mei" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions" exclude-result-prefixes="xs xd" xpath-default-namespace="http://www.music-encoding.org/ns/mei" version="2.0" xml:space="default">
  <!-- IMPORTs ======================================================= -->
  <xsl:import href="ediromOnline_params.xsl"/>
  <xsl:import href="ediromOnline_functions.xsl"/>
  <xsl:import href="ediromOnline_metadata.xsl"/>
  <!-- doc -->
  <xd:doc scope="stylesheet">
    <xd:desc>
      <xd:p><xd:b>Created on:</xd:b> Dec 21, 2011</xd:p>
      <xd:p><xd:b>Author:</xd:b>Johannes Kepper
                <xd:b>Author:</xd:b>Benjamin W. Bohl
            </xd:p>
    </xd:desc>
  </xd:doc>
  <!-- OUTPUT ======================================================= -->
  <xsl:output indent="yes" method="xml" omit-xml-declaration="yes"/>
  <xsl:param name="includeNotes">
    <xsl:value-of select="true()"/>
  </xsl:param>
  <!-- DEFAULT TEMPLATEs ======================================================= -->
  <xsl:template match="/">
    <xsl:apply-templates select="/mei:mei/mei:meiHead"/>
  </xsl:template>
  <!--<xsl:template match="* | @*" mode="#all">
        <xsl:apply-templates mode="#current"/>
    </xsl:template>-->
  <xsl:template match="node()" mode="plainCommaSep">
    <xsl:choose>
      <!-- nur attribute keinerlei kindknoten -->
      <xsl:when test="@* and not(node())">
        <!-- evtl attributnamen? -->
        <xsl:text>(</xsl:text>
        <xsl:apply-templates select="@*" mode="plainCommaSep"/>
        <xsl:text>)</xsl:text>
      </xsl:when>
      <!-- nur attribute und textknoten -->
      <xsl:when test="@* and not(*)">
        <xsl:apply-templates mode="plainCommaSep"/>
        <xsl:text> (</xsl:text>
        <xsl:choose>
          <xsl:when test="count(@*) gt 1">
            <!--<xsl:call-template name="attCommaSep"/>-->
            <xsl:value-of select="@*" separator=", "/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="@*" mode="plainCommaSep"/>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:text>)</xsl:text>
      </xsl:when>
      <!-- kindeskinder und attribute -->
      <xsl:when test="*/* and @*">
        <xsl:apply-templates select="@*" mode="plainCommaSep"/>
        <xsl:apply-templates select="*" mode="plainCommaSep"/>
      </xsl:when>
      <!-- kindeskinder keine attribute -->
      <xsl:when test="*/* and not(@*)">
        <xsl:apply-templates select="@*" mode="plainCommaSep"/>
        <xsl:apply-templates select="*" mode="plainCommaSep"/>
      </xsl:when>
      <!-- elemente und attribute -->
      <xsl:when test="* and @*">
        <xsl:apply-templates select="*" mode="plainCommaSep"/>
        <xsl:apply-templates select="@*" mode="plainCommaSep"/>
      </xsl:when>
      <!-- only element children that might have attributes -->
      <xsl:when test="*/@*">
        <xsl:for-each select="*">
          <xsl:apply-templates select="." mode="plainCommaSep"/>
          <xsl:if test="following-sibling::*">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </xsl:when>
      <!-- only element children without attributes -->
      <xsl:when test="*">
        <xsl:value-of select="*" separator=", "/>
      </xsl:when>
      <!-- if node is none of the above but has attribute -->
      <xsl:when test="@*">
        <xsl:text> (</xsl:text>
        <xsl:apply-templates select="@*" mode="plainCommaSep"/>
        <xsl:text>) </xsl:text>
      </xsl:when>
      <xsl:when test="(comment() and not(*)) or self::comment()"/>
      <!-- has to be an attribute -->
      <!--<xsl:when test="node()"></xsl:when>-->
      <xsl:otherwise>
        <xsl:value-of select="."/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!--<xsl:template name="attCommaSep">
    <xsl:variable name="attVals" as="element()*">
      <xsl:for-each select="@*">
        <xsl:element name="att">
          <xsl:apply-templates mode="plainCommaSep"/>
        </xsl:element>
      </xsl:for-each>
    </xsl:variable>
    <xsl:for-each select="$attVals/att">
      <xsl:copy-of select="*"/>
      <xsl:if test="index-of($attVals, .) lt count($attVals)">
        <xsl:text>, </xsl:text>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>-->
  <!--  <xsl:template match="comment()" mode="#all"/>-->
  <!--<xsl:template match="*" mode="plainDivs">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>-->
  <xsl:template match="@*" mode="subProp"/>
  <xsl:template match="@*" mode="valueOnly"/>
  <xsl:template match="node()" mode="subProp">
    <xsl:if test="@*">
      <xsl:text> (</xsl:text>
      <xsl:value-of select="@*" separator=", "/>
      <xsl:text>) </xsl:text>
    </xsl:if>
    <xsl:apply-templates mode="plainCommaSep"/>
  </xsl:template>
  <!-- TEMPLATEs ======================================================= -->
  <xsl:template match="@altrend | @rend" mode="#all"/>
  <xsl:template match="@label" mode="plainCommaSep"/>
  <xsl:template match="@role" mode="plainCommaSep">
    <xsl:value-of select="eof:getLabel(.)"/>
  </xsl:template>
  <xsl:template match="mei:address" mode="plainCommaSep">
    <xsl:element name="div">
      <xsl:attribute name="class">address plain</xsl:attribute>
      <xsl:value-of select="*" separator=", "/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="@target" mode="plainCommaSep">
    <!-- TODO choice -->
    <xsl:choose>
      <xsl:when test="starts-with(.,'xmldb:exist')">
        <!-- relativer link: non http , '/' darf xmldb:exist -->
        <xsl:element name="span">
          <xsl:attribute name="onclick">
            <xsl:text>loadLink('</xsl:text>
            <xsl:value-of select="."/>
            <xsl:text>')</xsl:text>
            <xsl:if test="false()"><xsl:text>[</xsl:text>]<!-- teiBody2HTML l:327 ff --></xsl:if>
          </xsl:attribute>
          <xsl:value-of select="."/>
        </xsl:element>
      </xsl:when>
      <xsl:when test="parent::mei:relation">
        <xsl:element name="a">
          <xsl:attribute name="href">#</xsl:attribute>
          <xsl:attribute name="onclick">
            <xsl:text>loadLink('</xsl:text>
            <xsl:value-of select="concat('xmldb:exist:///',.)"/>
            <xsl:text>')</xsl:text>
          </xsl:attribute>
          <xsl:value-of select="."/>
        </xsl:element>
      </xsl:when>
      <xsl:otherwise>
        <xsl:element name="a">
          <xsl:attribute name="href" select="."/>
          <xsl:attribute name="target">_blank</xsl:attribute>
          <xsl:value-of select="."/>
        </xsl:element>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="@xml:id" mode="plainCommaSep"/>
  <xsl:template match="mei:componentGrp">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:element name="div">
      <xsl:choose>
        <xsl:when test="$sub">
          <xsl:call-template name="rendToSubProperty"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="rendToProperty"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:element name="ol">
          <xsl:for-each select="*">
            <xsl:element name="li">
              <xsl:apply-templates mode="plainCommaSep"/>
            </xsl:element>
          </xsl:for-each>
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:componentGrp" mode="plainCommaSep">
    <!-- <xsl:element name="ul">
            <xsl:for-each select="*">
                <xsl:element name="li">
                    <xsl:apply-templates mode="#current"/>
                </xsl:element>
            </xsl:for-each>
            
        </xsl:element>-->
    <xsl:for-each select="*">
      <xsl:call-template name="makeSubProperty">
        <xsl:with-param name="node" select="."/>
        <xsl:with-param name="key" select="mei:titleStmt/mei:title"/>
      </xsl:call-template>
    </xsl:for-each>
  </xsl:template>
  <xsl:template match="mei:expression" mode="subProp">
    <xsl:value-of select=".//mei:instrVoice/@label" separator=", "/>
  </xsl:template>
  <xsl:template match="@xml:id" mode="subProp"/>
  <!--<xsltemplate match="mei:instrumentation" mode="subProp">
        <xsl:element name="ul">
            <xsl:for-each select="*">
                <xsl:element name="li">
                    <xsl:apply-templates mode="#current"/>
                </xsl:element>
            </xsl:for-each>
        </xsl:element>
    </xsltemplate>-->
  <xsl:template match="mei:meiHead">
    <xsl:element name="div">
      <xsl:attribute name="class">meiHead</xsl:attribute>
      <!--<xsl:apply-templates select="mei:fileDesc"/>
            <xsl:apply-templates select="mei:workDesc"/>-->
      <!-- TODO check for workDesc with resp data -->
      <!--<xsl:choose>
                <xsl:when test="count(./mei:workDesc/mei:work) gt 1">
                    <xsl:element name="div">
                        <xsl:attribute name="class">section</xsl:attribute>
                        <xsl:element name="h1">
                            <xsl:value-of select="eof:getLabel('works')"/>
                        </xsl:element>
                        <xsl:for-each select="./mei:workDesc/mei:work">
                            <xsl:call-template name="work">
                                <xsl:with-param name="labeled">
                                    <xsl:value-of select="true()"/>
                                </xsl:with-param>
                            </xsl:call-template>
                        </xsl:for-each>
                    </xsl:element>
                </xsl:when>
                <xsl:when test="./mei:workDesc/mei:work">
                    <xsl:apply-templates select="./mei:workDesc/mei:work">
                        <xsl:with-param name="labeled">
                            <xsl:value-of select="false()"/>
                        </xsl:with-param>
                    </xsl:apply-templates>
                </xsl:when>
            </xsl:choose>-->
      <!-- ende fileDesc -->
      <!-- encodingDesc -->
      <!--<xsl:apply-templates select="mei:encodingDesc"/>
            <xsl:apply-templates select="mei:revisionDesc"/>-->
      <xsl:for-each select="*">
        <xsl:call-template name="makeSection"/>
      </xsl:for-each>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:expressionList">
    <xsl:call-template name="makeSection">
      <xsl:with-param name="element" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:expression">
    <xsl:param name="key" select="@label"/>
    <xsl:param name="sub" tunnel="yes" select="true()"/>
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class" select="string('key')"/>
        <xsl:value-of select="eof:getLabel($key)"/>
        <xsl:if test="@unit and not(@unit eq '')">
          <xsl:element name="span"><xsl:attribute name="class">unit</xsl:attribute>
                        (<xsl:value-of select="eof:getLabel('classification')"/>: <xsl:value-of select="mei:classification//mei:term" separator=", "/>)
                    </xsl:element>
        </xsl:if>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class" select="string('value')"/>
        <xsl:apply-templates select="." mode="plainCommaSep">
          <xsl:with-param name="sub" select="$sub" tunnel="yes"/>
        </xsl:apply-templates>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:expression" mode="plainCommaSep">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:apply-templates mode="#current" select="@*|node()">
      <xsl:with-param name="sub" select="$sub" tunnel="yes"/>
    </xsl:apply-templates>
  </xsl:template>
  <xsl:template match="mei:workDesc">
    <xsl:variable name="numberOfworks" select="count(mei:work)"/>
    <xsl:choose>
      <xsl:when test="$numberOfworks = 1">
        <!--<xsl:call-template name="makeSection">
                    <xsl:with-param name="element" select="."/>
                </xsl:call-template>-->
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:when test="$numberOfworks gt 1">
        <!-- TODO implement sections for multiple works -->
        <xsl:apply-templates>
          <xsl:with-param name="labeled" select="true()"/>
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>
  <!--<xsl:template match="mei:work">
<!-\-        <xsl:element name="div">-\->
            <!-\-<xsl:call-template name="rendToProperty"/>-\->
<!-\-            <xsl:element name="div">-\->
        <xsl:apply-templates select="mei:titleStmt"/>
        <xsl:apply-templates select="mei:identifier"/>
        <xsl:apply-templates select="mei:pubStmt"/>
                <xsl:apply-templates select="*[local-name() != ('expressionList')]"/>
                <xsl:apply-templates select="mei:expressionList"/>
            <!-\-</xsl:element>-\->
        <!-\-</xsl:element>-\->
    </xsl:template>-->
  <!-- * labeled Wertitel anstatt standard wert
       * titleStmt
       * pubStmt
       * addtional meta mit: langUsage editionStmt notesStmt[includeNotes true]
       * history
       * musicalInfo mit key meter perfMEdium castLis
       * seriesStmt
  -->
  <xsl:template match="mei:work" name="work">
    <xsl:param name="labeled"/>
    <xsl:element name="div">
      <xsl:call-template name="rendToSection">
        <xsl:with-param name="key">
          <xsl:choose>
            <xsl:when test="$labeled eq 'true'">
              <xsl:value-of select="mei:titleStmt/title[1]/text()"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="eof:getLabel('workDesc')"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:with-param>
      </xsl:call-template>
      <xsl:element name="div">
        <xsl:attribute name="class" select="string('propertyList')"/>
        <xsl:for-each select="@*">
          <xsl:call-template name="makeProperty">
            <xsl:with-param name="key" select="local-name(.)"/>
          </xsl:call-template>
        </xsl:for-each>
        <xsl:apply-templates select="mei:titleStmt"/>
        <xsl:if test="count(mei:identifier) gt 0">
          <xsl:element name="div">
            <xsl:call-template name="rendToProperty">
              <xsl:with-param name="key" select="string('identifier')"/>
            </xsl:call-template>
            <xsl:element name="div">
              <xsl:attribute name="class">value</xsl:attribute>
              <xsl:for-each select="mei:identifier">
                <xsl:call-template name="makeSubProperty">
                  <xsl:with-param name="node" select="."/>
                  <xsl:with-param name="key" select="@type"/>
                </xsl:call-template>
              </xsl:for-each>
            </xsl:element>
          </xsl:element>
        </xsl:if>
        <xsl:apply-templates select="mei:pubStmt"/>
        <xsl:apply-templates select="mei:classification"/>
        <xsl:if test="mei:langUsage | mei:editionStmt">
          <!-- TODO test  | mei:classification-->
          <xsl:element name="div">
            <xsl:attribute name="class">section</xsl:attribute>
            <xsl:call-template name="rendToSection">
              <xsl:with-param name="key" select="eof:getLabel('additionalMeta')"/>
            </xsl:call-template>
            <xsl:element name="div">
              <xsl:attribute name="class">propertyList</xsl:attribute>
              <xsl:apply-templates select="mei:langUsage | mei:editionStmt" mode="plainCommaSep"/>
              <!--  | mei:classification -->
            </xsl:element>
          </xsl:element>
        </xsl:if>
        <!--<xsl:if test="mei:history and mei:history/child::*/node()">
                    <xsl:element name="div">
                        <xsl:attribute name="class">section</xsl:attribute>
                        <xsl:element name="h1">
                            <xsl:choose>
                                <xsl:when test="mei:history/mei:head/node()">
                                    <xsl:apply-templates select="mei:history/mei:head"/>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="eof:getLabel('history')"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:element>
                        <xsl:element name="div">
                            <xsl:attribute name="class">propertyList</xsl:attribute>
                            <xsl:apply-templates select="mei:history/creation | mei:history/mei:p |mei:history/mei:eventList"/>
                        </xsl:element>
                    </xsl:element>
                </xsl:if>-->
        <xsl:apply-templates select="mei:history"/>
        <xsl:if test="mei:key or mei:meter or mei:perfMedium or mei:castList or mei:componentGrp">
          <xsl:element name="div">
            <xsl:attribute name="class">section</xsl:attribute>
            <xsl:element name="h1">
              <xsl:value-of select="eof:getLabel('musicalInfo')"/>
            </xsl:element>
            <xsl:element name="div">
              <xsl:attribute name="class">propertyList</xsl:attribute>
              <xsl:apply-templates select="mei:key | mei:meter | mei:perfMedium | mei:castList | mei:componentGrp"/>
            </xsl:element>
          </xsl:element>
        </xsl:if>
        <xsl:if test="count(mei:seriesStmt/child::node()) gt 0">
          <xsl:element name="div">
            <xsl:attribute name="class">section</xsl:attribute>
            <xsl:element name="h1">
              <xsl:value-of select="eof:getLabel('series')"/>
            </xsl:element>
            <xsl:apply-templates select="mei:seriesStmt"/>
          </xsl:element>
        </xsl:if>
        <!--                <xsl:apply-templates select="mei:componentGrp"/>-->
        <xsl:apply-templates select="mei:expressionList"/>
        <xsl:apply-templates select="mei:notesStmt"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:change">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel(local-name())"/>
        <xsl:if test="@n">
          <xsl:value-of select="concat(' ', @n)"/>
        </xsl:if>
        <xsl:if test="mei:date">
          <xsl:element name="span">
            <xsl:attribute name="class">date</xsl:attribute>
            <xsl:apply-templates select="mei:date[1]" mode="valueOnly"/>
          </xsl:element>
        </xsl:if>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="mei:respStmt" mode="valueOnly"/>
        <xsl:apply-templates select="./changeDesc/p" mode="valueOnly"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:fileDesc">
    <xsl:element name="div">
      <xsl:call-template name="makeSection"/>
    </xsl:element>
  </xsl:template>
  <!--<xsl:template match="mei:fileDesc" mode="getFileInfo">
        <xsl:apply-templates select="./mei:titleStmt"/>
        <xsl:if test="count(./pubStmt/child::node()) gt 0">
            <xsl:element name="div">
                <xsl:attribute name="class">section</xsl:attribute>
                <xsl:element name="h1">
                    <xsl:value-of select="eof:getLabel('publication')"/>
                </xsl:element>
                <xsl:apply-templates select="./pubStmt"/>
            </xsl:element>
        </xsl:if>
        <xsl:if test="count(./seriesStmt/child::node()) gt 0">
            <xsl:element name="div">
                <xsl:attribute name="class">section</xsl:attribute>
                <xsl:element name="h1">
                    <xsl:value-of select="eof:getLabel('series')"/>
                </xsl:element>
                <xsl:apply-templates select="./seriesStmt"/>
            </xsl:element>
        </xsl:if>
    </xsl:template>-->
  <xsl:template match="mei:history">
    <xsl:call-template name="makeProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:history" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <!--<xsl:template match="mei:titleStmt">
<!-\-        <xsl:element name="div">-\->
<!-\-            <xsl:attribute name="class">propertyList</xsl:attribute>-\->
        <xsl:for-each select="./title">
            <xsl:call-template name="title"/>
        </xsl:for-each>
        <xsl:for-each select="./respStmt/*">
            <xsl:call-template name="resp"/>
        </xsl:for-each>
        <!-\-</xsl:element>-\->
    </xsl:template>-->
  <!--<xsl:template match="mei:pubStmt">
        <xsl:element name="div">
            <xsl:attribute name="class">propertyList</xsl:attribute>
            <xsl:for-each select="./respStmt/*[not(local-name() eq 'resp')]">
                <xsl:call-template name="resp"/>
            </xsl:for-each>
            <xsl:for-each select="./address">
                <xsl:call-template name="address"/>
            </xsl:for-each>
            <xsl:for-each select="./date">
                <xsl:call-template name="date">
                    <xsl:with-param name="label">
                        <xsl:value-of select="eof:getLabel('publicationDate')"/>
                    </xsl:with-param>
                </xsl:call-template>
            </xsl:for-each>
            <xsl:for-each select="./availability">
                <xsl:for-each select="./*">
                    <xsl:element name="div">
                        <xsl:attribute name="class">property</xsl:attribute>
                        <xsl:element name="div">
                            <xsl:attribute name="class">key</xsl:attribute>
                            <xsl:value-of select="concat(upper-case(substring(local-name(),1,1)), substring(local-name(),2))"/>
                        </xsl:element>
                        <xsl:element name="div">
                            <xsl:attribute name="class">value</xsl:attribute>
                            <xsl:choose>
                                <xsl:when test="not(./text() = '')"><!-\- TODO: @bwb to git = vs eq -\->
                                    <xsl:value-of select="./text()"/>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="string(' ')"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:element>
                    </xsl:element>
                </xsl:for-each>
            </xsl:for-each>
            <xsl:for-each select="./identifier">
                <xsl:call-template name="identifier"/>
            </xsl:for-each>
            <xsl:for-each select="./geogName">
                <xsl:call-template name="geogName"/>
            </xsl:for-each>
            <xsl:if test="./unpub">
                <xsl:element name="div">
                    <xsl:attribute name="class">property</xsl:attribute>
                    <xsl:element name="div">
                        <xsl:attribute name="class">key</xsl:attribute>
                        <xsl:value-of select="string(' ')"/>
                    </xsl:element>
                    <xsl:element name="div">
                        <xsl:attribute name="class">value</xsl:attribute>
                        <xsl:value-of select="eof:getLabel('unpub')"/>
                    </xsl:element>
                </xsl:element>
            </xsl:if>
        </xsl:element>
    </xsl:template>-->
  <xsl:template match="mei:list" mode="valueOnly">
    <xsl:element name="ul">
      <xsl:apply-templates mode="valueOnly"/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:li" mode="valueOnly">
    <xsl:element name="li">
      <xsl:apply-templates mode="valueOnly"/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:pubStmt">
    <xsl:call-template name="makeProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:pubStmt" mode="plainCommaSep">
    <xsl:apply-templates mode="#current"/>
  </xsl:template>
  <xsl:template match="mei:pubPlace | mei:publisher" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:seriesStmt">
    <xsl:variable name="sub">
      <xsl:choose>
        <xsl:when test="ancestor::mei:work">
          <!-- TODO test -->
          <xsl:value-of select="true()"/>
        </xsl:when>
        <xsl:when test="ancestor::mei:source">
          <xsl:value-of select="false()"/>
        </xsl:when>
      </xsl:choose>
    </xsl:variable>
    <xsl:call-template name="propOrSub">
      <xsl:with-param name="sub" select="$sub"/>
      <xsl:with-param name="key" select="local-name(.)"/>
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
    <!--<xsl:element name="div">
            <xsl:call-template name="rendToSubProperty">
                <xsl:with-param name="key" select="string('seriesStmt')"/>
            </xsl:call-template>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates>
                    <xsl:with-param name="sub" select="true()"></xsl:with-param>
                </xsl:apply-templates>
            </xsl:element>
        </xsl:element>-->
    <!--<xsl:element name="div">
            <xsl:attribute name="class">propertyList</xsl:attribute>
            <xsl:for-each select="./title">
                <xsl:call-template name="title"/>
            </xsl:for-each>
            <xsl:for-each select="./respStmt/*[not(local-name() eq 'resp')]">
                <xsl:call-template name="resp"/>
            </xsl:for-each>
            <xsl:for-each select="./identifier">
                <xsl:call-template name="identifier"/>
            </xsl:for-each>
        </xsl:element>-->
  </xsl:template>
  <xsl:template match="mei:source" name="source">
    <xsl:param name="labeled"/>
    <!--<xsl:element name="div">-->
    <!--<xsl:attribute name="class">section</xsl:attribute>-->
    <xsl:if test="$labeled eq 'true'">
      <xsl:element name="h1">
        <xsl:value-of select="./titleStmt/title[1]/text()"/>
      </xsl:element>
    </xsl:if>
    <!--<xsl:otherwise>
                <xsl:value-of select="eof:getLabel('sourceDesc')"/>
            </xsl:otherwise>-->
    <!--<xsl:element name="div">-->
    <xsl:apply-templates select="mei:titleStmt">
      <xsl:with-param name="sub" tunnel="yes"/>
    </xsl:apply-templates>
    <!--</xsl:element>-->
    <xsl:if test="count(mei:identifier) gt 0">
      <xsl:element name="div">
        <xsl:call-template name="rendToProperty">
          <xsl:with-param name="key" select="string('identifier')"/>
        </xsl:call-template>
        <xsl:element name="div">
          <xsl:attribute name="class">value</xsl:attribute>
          <xsl:for-each select="mei:identifier">
            <xsl:call-template name="makeSubProperty">
              <xsl:with-param name="node" select="."/>
              <xsl:with-param name="key" select="@type"/>
            </xsl:call-template>
          </xsl:for-each>
        </xsl:element>
      </xsl:element>
    </xsl:if>
    <!--<xsl:if test="count(./pubStmt/child::*) gt 0"><!-\- TODO -\->
            <xsl:element name="div">
                <xsl:attribute name="class">section</xsl:attribute>
                <xsl:element name="h1">
                    <xsl:value-of select="eof:getLabel('publication')"/>
                </xsl:element>
                <xsl:apply-templates select="./pubStmt"/>
            </xsl:element>
        </xsl:if>-->
    <xsl:apply-templates select="./mei:pubStmt"/>
    <!--<xsl:if test="./history and ./history/child::*/node()">
            <xsl:element name="div">
                <xsl:attribute name="class">section</xsl:attribute>
                <xsl:element name="h1">
                    <xsl:choose>
                        <xsl:when test="./history/head/node()">
                            <xsl:apply-templates select="./history/head"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="eof:getLabel('history')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:element>
                <xsl:element name="div">
                    <xsl:attribute name="class">propertyList</xsl:attribute>
                    <xsl:apply-templates select="./history/creation | ./history/p |./history/eventList"/>
                </xsl:element>
            </xsl:element>
        </xsl:if>-->
    <xsl:apply-templates select="mei:physDesc"/>
    <xsl:apply-templates select="mei:history"/>
    <xsl:if test="./key or ./meter or ./perfMedium or ./castList or mei:componentGrp">
      <xsl:element name="div">
        <xsl:attribute name="class">section</xsl:attribute>
        <xsl:element name="h1">
          <xsl:value-of select="eof:getLabel('musicalInfo')"/>
        </xsl:element>
        <xsl:element name="div">
          <xsl:attribute name="class">propertyList</xsl:attribute>
          <xsl:apply-templates select="./key | ./meter | ./perfMedium | ./castList | mei:componentGrp"/>
        </xsl:element>
      </xsl:element>
    </xsl:if>
    <xsl:if test="count(./seriesStmt/child::node()) gt 0">
      <xsl:element name="div">
        <xsl:attribute name="class">section</xsl:attribute>
        <xsl:element name="h1">
          <xsl:value-of select="eof:getLabel('series')"/>
        </xsl:element>
        <xsl:apply-templates select="./seriesStmt"/>
      </xsl:element>
    </xsl:if>
    <xsl:apply-templates select="mei:classification"/>
    <xsl:apply-templates select="mei:itemList"/>
    <xsl:apply-templates select="mei:notesStmt"/>
    <!--<xsl:if test="./langUsage or ./editionStmt or (mei:notesStmt and $includeNotes = true())"> <!-\- TODO -\->
            <xsl:element name="div">
                <xsl:attribute name="class">section</xsl:attribute>
                <xsl:element name="h1">
                    <xsl:value-of select="eof:getLabel('additionalMeta')"/>
                </xsl:element>
                <xsl:element name="div">
                    <xsl:attribute name="class">propertyList</xsl:attribute>
                    <xsl:apply-templates select="./langUsage | ./editionStmt"/>
                    <xsl:if test="$includeNotes = true()">
                        <xsl:apply-templates select="mei:notesStmt"/>
                    </xsl:if>
                </xsl:element>
            </xsl:element>
        </xsl:if>-->
  </xsl:template>
  <xsl:template match="mei:title" name="title" mode="#all">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:element name="div">
      <xsl:attribute name="class" select="if($sub)then(string('subProperty'))else(string('property'))"/>
      <xsl:element name="div">
        <xsl:attribute name="class" select="if($sub)then(string('subkey'))else(string('key'))"/>
        <xsl:choose>
          <xsl:when test="@type eq 'uniform'">
            <xsl:value-of select="eof:getLabel('uniformTitle')"/>
          </xsl:when>
          <xsl:when test="@type eq 'main'">
            <xsl:value-of select="eof:getLabel('mainTitle')"/>
          </xsl:when>
          <xsl:when test="lower-case(@type) eq 'subordinate' or lower-case(@type) eq 'subtitle'">
            <xsl:value-of select="eof:getLabel('subTitle')"/>
          </xsl:when>
          <xsl:when test="@type eq 'alternative'">
            <xsl:value-of select="eof:getLabel('altTitle')"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="eof:getLabel('title')"/>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="@xml:lang">
          <xsl:element name="span"><xsl:attribute name="class">lang</xsl:attribute>
                        (<xsl:value-of select="@xml:lang"/>)
                    </xsl:element>
        </xsl:if>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class" select="if($sub)then(string('subvalue'))else(string('value'))"/>
        <xsl:call-template name="titleValue"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <!--<xsl:template match="mei:title" mode="plainCommaSep">
        <xsl:param name="sub"/>
        <xsl:call-template name="makeSubProperty"/>
    </xsl:template>-->
  <xsl:template match="title" name="titleValue" mode="valueOnly">
    <xsl:value-of select="./node()" separator=" "/>
  </xsl:template>
  <xsl:template match="mei:relation" mode="plainCommaSep">
    <xsl:element name="span">
      <xsl:value-of select="@rel"/>
    </xsl:element>
    <xsl:text>: </xsl:text>
    <xsl:element name="span">
      <xsl:apply-templates select="@target"/>
    </xsl:element>
    <xsl:text>;</xsl:text>
  </xsl:template>
  <xsl:template match="mei:relationList" mode="subProp">
    <xsl:apply-templates mode="#current"/>
  </xsl:template>
  <xsl:template match="mei:relationList">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:call-template name="makeProperty">
      <xsl:with-param name="node" select="."/>
      <xsl:with-param name="sub" tunnel="yes"/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:relationList" mode="plainCommaSep">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:choose>
      <xsl:when test="$sub">
        <xsl:call-template name="makeSubProperty">
          <xsl:with-param name="node" select="."/>
          <xsl:with-param name="sub" tunnel="yes"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>

            </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="mei:respStmt" name="respStmt">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:variable name="key">
      <xsl:choose>
        <xsl:when test="@label">
          <xsl:value-of select="@label"/>
        </xsl:when>
        <xsl:when test="@role">
          <xsl:value-of select="@role"/>
        </xsl:when>
        <xsl:when test="mei:resp">
          <xsl:value-of select="mei:resp"/>
        </xsl:when>
        <xsl:when test="count(distinct-values(*/tokenize(@role,' '))) = 1">
          <xsl:value-of select="distinct-values(*/tokenize(@role,' '))[1]"/>
        </xsl:when>
        <xsl:when test="(count(distinct-values(*/tokenize(@role,' '))) = 2) and ('led' = (distinct-values(*/tokenize(@role,' '))))">
          <xsl:value-of select="(distinct-values(*/tokenize(@role,' ')))[. != 'led']"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="eof:getLabel(local-name())"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="false()">
        <xsl:element name="div">
          <xsl:call-template name="rendToProperty"/>
          <xsl:call-template name="propOrSub">
            <xsl:with-param name="sub" select="$sub"/>
            <xsl:with-param name="node" select="."/>
            <xsl:with-param name="key" select="$key"/>
          </xsl:call-template>
        </xsl:element>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="propOrSub">
          <xsl:with-param name="sub" select="$sub"/>
          <xsl:with-param name="node" select="."/>
          <xsl:with-param name="key" select="$key"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="mei:respStmt" mode="plainCommaSep">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:variable name="key">
      <xsl:choose>
        <xsl:when test="@label">
          <xsl:value-of select="@label"/>
        </xsl:when>
        <xsl:when test="@role">
          <xsl:value-of select="@role"/>
        </xsl:when>
        <xsl:when test="mei:resp">
          <xsl:value-of select="mei:resp"/>
        </xsl:when>
        <xsl:when test="count(distinct-values(*/tokenize(@role,' '))) = 1">
          <xsl:value-of select="distinct-values(*/tokenize(@role,' '))[1]"/>
        </xsl:when>
        <xsl:when test="(count(distinct-values(*/tokenize(@role,' '))) = 2) and ('led' = (distinct-values(*/tokenize(@role,' '))))">
          <xsl:value-of select="(distinct-values(*/tokenize(@role,' ')))[. != 'led']"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="eof:getLabel(local-name())"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
      <xsl:with-param name="key" select="$key"/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:persName['led' = tokenize(@role, ' ')]" mode="plainCommaSep subProp">
    <xsl:apply-templates mode="#current"/>
    <xsl:text> (</xsl:text>
    <xsl:value-of select="eof:getLabel('led')"/>
    <xsl:text>)</xsl:text>
  </xsl:template>
  <!--<xsl:template match="@role" mode="#default">
        <xsl:text> (</xsl:text>
        <xsl:value-of select="eof:getLabel('led')"/>
        <xsl:text>)</xsl:text>
    </xsl:template>-->
  <!--<xsl:template match="mei:respStmt/*" mode="plainCommaSep">
        <xsl:apply-templates mode="#current"/>
    </xsl:template>-->
  <!--<xsl:template match="respStmt/*[not(local-name() eq 'resp')]" name="resp" mode="plainCommaSep">
            <xsl:element name="div">
                <xsl:attribute name="class">property</xsl:attribute>
                <xsl:element name="div">
                    <xsl:attribute name="class">key</xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="./@role">
                            <xsl:value-of select="eof:getLabel(@role)"/>
                        </xsl:when>
                        <xsl:when test="exists(./ancestor::*[local-name() eq 'pubStmt']) and count(preceding-sibling::*) eq 0 and count(following-sibling::*) eq 0">
                            <xsl:value-of select="eof:getLabel('publisher')"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="eof:getLabel('responsible')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:element>
                <xsl:element name="div">
                    <xsl:attribute name="class">value</xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="@authURI">
                            <xsl:element name="a">
                                <xsl:attribute name="class">authURI</xsl:attribute>
                                <xsl:attribute name="href">
                                    <xsl:value-of select="@authURI"/>
                                </xsl:attribute>
                                <xsl:value-of select="./text()"/>
                            </xsl:element>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="./text()"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:element>
            </xsl:element>
        </xsl:template>-->
  <!--<xsl:template match="respStmt/*[not(local-name() eq 'resp')]" name="respValue" mode="valueOnly">
        <xsl:choose>
            <xsl:when test="@authURI">
                <xsl:element name="a">
                    <xsl:attribute name="class">authURI</xsl:attribute>
                    <xsl:attribute name="href">
                        <xsl:value-of select="@authURI"/>
                    </xsl:attribute>
                    <xsl:value-of select="./text()"/>
                </xsl:element>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="./text()"/>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:variable name="role">
            <xsl:choose>
                <xsl:when test="./@role eq 'composer'">
                    <xsl:value-of select="eof:getLabel('composer')"/>
                </xsl:when>
                <xsl:when test="./@role eq 'lyricist'">
                    <xsl:value-of select="eof:getLabel('lyricist')"/>
                </xsl:when>
                <xsl:when test="./@role eq 'librettist'">
                    <xsl:value-of select="eof:getLabel('librettist')"/>
                </xsl:when>
                <xsl:when test="./@role eq 'publisher'">
                    <xsl:value-of select="eof:getLabel('publisher')"/>
                </xsl:when>
                <xsl:when test="./@role eq 'funder'">
                    <xsl:value-of select="eof:getLabel('funder')"/>
                </xsl:when>
                <!-\- TODO: Add other values -\->
                <xsl:when test="./@role">
                    <xsl:value-of select="concat(upper-case(substring(@role,1,1)), substring(@role,2))"/>
                </xsl:when>
                <xsl:when test="exists(./ancestor::*[local-name() eq 'pubStmt']) and count(preceding-sibling::*) eq 0 and count(following-sibling::*) eq 0">
                    <xsl:value-of select="eof:getLabel('publisher')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="string('')"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:if test="not($role eq '')">
            <xsl:element name="br"/>
            <xsl:value-of select="concat('[',$role,']')"/>
        </xsl:if>
    </xsl:template>-->
  <xsl:template match="key">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('key')"/>
      </xsl:element>
      <!-- TODO: make key language specific… -->
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:variable name="pname">
          <xsl:choose>
            <xsl:when test="matches(@pname, '[cdfg]') and @accid.ges eq 'ff'">
              <xsl:value-of select="concat(upper-case(@pname), 'eses')"/>
            </xsl:when>
            <xsl:when test="@pname eq 'e' and @accid.ges eq 'ff'">
              <xsl:value-of select="string('Eses')"/>
            </xsl:when>
            <xsl:when test="@pname eq 'a' and @accid.ges eq 'ff'">
              <xsl:value-of select="string('Asas')"/>
            </xsl:when>
            <xsl:when test="@pname eq 'b' and @accid.ges eq 'ff'">
              <xsl:value-of select="string('Heses')"/>
            </xsl:when>
            <xsl:when test="matches(@pname, '[cdfg]') and @accid.ges eq 'f'">
              <xsl:value-of select="concat(upper-case(@pname), 'es')"/>
            </xsl:when>
            <xsl:when test="matches(@pname,'[ae]') and @accid.ges eq 'f'">
              <xsl:value-of select="concat(upper-case(@pname), 's')"/>
            </xsl:when>
            <xsl:when test="@pname eq 'b' and @accid.ges eq 'ff'">
              <xsl:value-of select="string('B')"/>
            </xsl:when>
            <xsl:when test="matches(@pname, '[cdefga]') and (not(@accid.ges) or @accid.ges eq 'n')">
              <xsl:value-of select="upper-case(@pname)"/>
            </xsl:when>
            <xsl:when test="@pname eq 'b' and (not(@accid.ges) or @accid.ges eq 'n')">
              <xsl:value-of select="string('H')"/>
            </xsl:when>
            <xsl:when test="matches(@pname, '[cdefga]') and @accid.ges eq 's'">
              <xsl:value-of select="concat(upper-case(@pname), 'is')"/>
            </xsl:when>
            <xsl:when test="@pname eq 'b' and @accid.ges eq 's'">
              <xsl:value-of select="string('His')"/>
            </xsl:when>
            <xsl:when test="matches(@pname, '[cdefga]') and @accid.ges eq 'ss'">
              <xsl:value-of select="concat(upper-case(@pname), 'isis')"/>
            </xsl:when>
            <xsl:when test="@pname eq 'b' and @accid.ges eq 'ss'">
              <xsl:value-of select="string('Hisis')"/>
            </xsl:when>
          </xsl:choose>
        </xsl:variable>
        <xsl:variable name="mode">
          <xsl:choose>
            <xsl:when test="@mode eq 'major'">
              <xsl:text>Dur</xsl:text>
            </xsl:when>
            <xsl:when test="@mode eq 'minor'">
              <xsl:text>Moll</xsl:text>
            </xsl:when>
            <!-- TODO: Sonstige Tonarten -->
          </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="concat($pname, '-', $mode)"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="meter">
    <!-- TODO -->
  </xsl:template>
  <xsl:template match="mei:castList">
    <xsl:apply-templates mode="plainCommaSep"/>
  </xsl:template>
  <xsl:template match="mei:castGrp" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
      <xsl:with-param name="key">
        <xsl:choose>
          <xsl:when test="@label">
            <xsl:value-of select="@label"/>
          </xsl:when>
        </xsl:choose>
      </xsl:with-param>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:castGrp" mode="subProp">
    <xsl:apply-templates select="@* except (@label)" mode="#current"/>
    <xsl:apply-templates mode="plainCommaSep"/>
  </xsl:template>
  <xsl:template match="mei:castItem" mode="plainCommaSep">
    <xsl:choose>
      <xsl:when test="mei:actor and (mei:role or mei:roleDesc)">
        <xsl:value-of select="mei:actor"/>
        <xsl:text> [</xsl:text>
        <xsl:value-of select="mei:role|mei:roleDesc" separator=", "/>
        <xsl:text>]</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates mode="#current"/>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:choose>
      <xsl:when test="following-sibling::mei:castItem">
        <xsl:text>; </xsl:text>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="mei:perfMedium" mode="subProp">
    <xsl:apply-templates mode="#current"/>
  </xsl:template>
  <!--<xsl:template match="perfMedium">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('instrumentation')"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:for-each select=".//performer">
                    <xsl:choose>
                        <xsl:when test="not(./instrVoice/@count) or number(./instrVoice/@count) eq 1">
                            <xsl:text>1 </xsl:text>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="concat(./instrVoice/@count, ' ')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:if test="./instrVoice/@solo eq 'true'">
                        <xsl:text>Solo-</xsl:text>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="./instrVoice/text() eq '' and ./instrVoice/@label">
                            <xsl:value-of select="./instrVoice/@label"/>
                        </xsl:when>
                        <xsl:when test="not(./instrVoice/text() eq '')">
                            <xsl:value-of select="./instrVoice/text()"/>
                        </xsl:when>
                        <xsl:when test="./instrVoice/text() eq '' and ./instrVoice/@reg">
                            <xsl:value-of select="./instrVoice/@reg"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:choose>
                                <xsl:when test="number(./instrVoice/@count) gt 1">
                                    <xsl:value-of select="eof:getLabel('unspecPerfMulti')"/>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="eof:getLabel('unspecPerfSingle')"/>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:element name="br"/>
                </xsl:for-each>
            </xsl:element>
        </xsl:element>
    </xsl:template>-->
  <!--<xsl:template match="castList">
        <!-\- TODO -\->
    </xsl:template>-->
  <xsl:template match="mei:identifier" name="identifier">
    <xsl:call-template name="makeProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:identifier[parent::mei:source]" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:identifier" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:corpName[parent::mei:edition]" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:identifier[parent::mei:pubStmt]">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:instrumentation">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:element name="div">
      <xsl:attribute name="class" select="if($sub)then(string('subProperty'))else(string('property'))"/>
      <xsl:element name="div">
        <xsl:attribute name="class" select="if($sub)then(string('subkey'))else(string('key'))"/>
        <xsl:value-of select="eof:getLabel(local-name())"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class" select="if($sub)then(string('subvalue'))else(string('value'))"/>
        <xsl:element name="ul">
          <xsl:for-each select="*">
            <xsl:element name="li">
              <xsl:value-of select="."/>
              <xsl:if test="@code">
                <xsl:text> (</xsl:text>
                <xsl:element name="a">
                  <xsl:attribute name="href" select="@authURI"/>
                  <xsl:attribute name="target">_blank</xsl:attribute>
                  <xsl:value-of select="@code"/>
                </xsl:element>
                <xsl:text>)</xsl:text>
              </xsl:if>
            </xsl:element>
          </xsl:for-each>
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:instrVoice"/>
  <xsl:template match="mei:availability" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="creation">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('creation')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="./child::node()[1]"/>
        <xsl:for-each select="./child::*[count(preceding-sibling::*) gt 0]">
          <xsl:element name="br"/>
          <xsl:apply-templates select="node()" mode="valueOnly"/>
          <xsl:value-of select="string(' ')"/>
        </xsl:for-each>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:useRestrict" mode="plainCommaSep">
    <xsl:apply-templates mode="#current"/>
  </xsl:template>
  <xsl:template match="mei:lb" mode="plainCommaSep">
    <br/>
  </xsl:template>
  <!--<xsl:template match="mei:editionStmt" mode="#all">
        <!-\-<xsl:for-each select="./*">
            <xsl:choose>
                <xsl:when test="local-name() eq 'respStmt'">
                    <xsl:for-each select="./*[not(local-name() eq 'resp')]">
                        <xsl:call-template name="resp"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="local-name() eq 'edition'">
                    <xsl:apply-templates select="."/>
                </xsl:when>
            </xsl:choose>
        </xsl:for-each>-\->
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
        <!-\-<xsl:apply-templates mode="plainCommaSep">
<!-\\-          <xsl:with-param name="sub" select="true()"/>-\\->
        </xsl:apply-templates>-\->
    </xsl:template>-->
  <!--<xsl:template match="mei:editionStmt">
    <!-\-<xsl:call-template name="makeProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>-\->
    <xsl:apply-templates mode="#current">
      <xsl:wi
    </xsl:apply-templates>
  </xsl:template>-->
  <xsl:template match="mei:editionStmt" mode="plainCommaSep">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:apply-templates mode="#current">
      <xsl:with-param name="sub" select="true()" tunnel="yes"/>
    </xsl:apply-templates>
  </xsl:template>
  <xsl:template match="mei:edition">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:call-template name="makeProperty">
      <xsl:with-param name="node" select="."/>
      <xsl:with-param name="sub" select="$sub" tunnel="yes"/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:edition" mode="plainCommaSep">
    <xsl:apply-templates select="@*"/>
    <xsl:apply-templates select="*" mode="plainCommaSep">
      <xsl:with-param name="sub" select="true()" tunnel="yes"/>
    </xsl:apply-templates>
  </xsl:template>
  <xsl:template match="mei:fig" mode="#all">
    <xsl:choose>
      <xsl:when test="mei:graphic">
        <xsl:apply-templates select="mei:graphic" mode="#current">
          <xsl:with-param name="alt" select="mei:figDesc"/>
        </xsl:apply-templates>
      </xsl:when>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="mei:graphic" mode="#all">
    <xsl:param name="alt"/>
    <xsl:element name="img">
      <xsl:attribute name="src">
        <xsl:apply-templates select="@target" mode="plainCommaSep"/>
      </xsl:attribute>
      <xsl:attribute name="alt" select="$alt"/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="geogName" name="geogName">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('geogName')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:call-template name="geogNameValue"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="geogName" name="geogNameValue" mode="valueOnly">
    <xsl:apply-templates select="node()" mode="#current"/>
  </xsl:template>
  <!--<xsl:template match="eventList">
        <xsl:for-each select="./event">
            <xsl:element name="div">
                <xsl:attribute name="class">property</xsl:attribute>
                <xsl:element name="div">
                    <xsl:attribute name="class">key</xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="@label">
                            <xsl:value-of select="@label"/>
                        </xsl:when>
                        <xsl:when test="local-name(child::*[1]) eq 'title'">
                            <xsl:apply-templates select="./rceedition[1]" mode="valueOnly"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="eof:getLabel('event')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:element>
                <xsl:element name="div">
                    <xsl:attribute name="class">value</xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="local-name(child::*[1]) eq 'title'">
                            <xsl:apply-templates select="node() except title[1]" mode="valueOnly"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:apply-templates select="node()" mode="valueOnly"/>
                            <xsl:value-of select="string(' ')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:element>
            </xsl:element>
        </xsl:for-each>
    </xsl:template>-->
  <xsl:template match="geogName" mode="valueOnly">
    <xsl:apply-templates select="node()"/>
  </xsl:template>
  <xsl:template match="langUsage">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('language')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="language[1]/node()"/>
        <xsl:for-each select="./language[count(preceding-sibling::language) gt 0]">
          <xsl:element name="br"/>
          <xsl:apply-templates select="node()"/>
        </xsl:for-each>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="notesStmt" mode="musicEncodingOrg">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('notesStmt')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:for-each select="./annot">
          <xsl:element name="p">
            <xsl:if test="@label">
              <xsl:element name="h2">
                <xsl:attribute name="class">annotHead</xsl:attribute>
                <xsl:value-of select="@label"/>
              </xsl:element>
            </xsl:if>
            <xsl:apply-templates select="node()"/>
            <!-- resolve plist, resp, source, type -->
          </xsl:element>
        </xsl:for-each>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:annot[@type='movementConcordance']"/>
  <xsl:template match="mei:annot[@type='connection']"/>
  <xsl:template match="mei:annot[@type='criticalCommentary']">
    <xsl:element name="div">
      <xsl:call-template name="rendToProperty">
        <xsl:with-param name="key" select="@type"/>
      </xsl:call-template>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:value-of select="count(mei:annot)"/>
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:value-of select="eof:getLabel('switch2sourceView')"/>
          </xsl:attribute>
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:annot">
    <xsl:call-template name="makeProperty">
      <xsl:with-param name="node" select="."/>
      <xsl:with-param name="key">
        <xsl:choose>
          <xsl:when test="@label">
            <xsl:value-of select="@label"/>
          </xsl:when>
          <xsl:when test="@type">
            <xsl:value-of select="@type"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="local-name()"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:with-param>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="@label[parent::mei:annot] | @type[parent::mei:annot]" mode="plainCommaSep"/>
  <xsl:template match="address" name="address">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('address')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:call-template name="addressValue"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="address" name="addressValue" mode="valueOnly">
    <xsl:for-each select="./addrLine">
      <xsl:value-of select="./text()"/>
      <xsl:if test="./following-sibling::addrLine">
        <xsl:element name="br"/>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>
  <xsl:template match="mei:classification">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:choose>
      <xsl:when test="$sub">
        <xsl:call-template name="makeSubProperty">
          <xsl:with-param name="node" select="."/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="makeProperty">
          <xsl:with-param name="node" select="."/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="mei:classification" mode="plainCommaSep">
    <xsl:param name="sub" tunnel="yes"/>
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="date" name="date">
    <xsl:param name="label"/>
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="$label"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:call-template name="dateValue"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="date" name="dateValue" mode="valueOnly">
    <xsl:choose>
      <xsl:when test="@isodate">
        <!-- TODO: prettify date -->
        <xsl:value-of select="@isodate"/>
      </xsl:when>
      <xsl:when test="@startdate and @enddate">
        <xsl:value-of select="eof:getLabel('dateFrom')"/>
        <xsl:value-of select="@startdate"/>
        <xsl:value-of select="eof:getLabel('dateUntil')"/>
        <xsl:value-of select="@enddate"/>
      </xsl:when>
      <xsl:when test="@notbefore and @notafter"><xsl:value-of select="eof:getLabel('dateNotbefore')"/><xsl:value-of select="@notbefore"/>, <xsl:value-of select="eof:getLabel('dateNotafter')"/><xsl:value-of select="@notafter"/></xsl:when>
      <xsl:when test="@startdate and @notafter"><xsl:value-of select="eof:getLabel('dateFrom')"/><xsl:value-of select="@startdate"/>, <xsl:value-of select="eof:getLabel('dateNotafter')"/><xsl:value-of select="@notafter"/></xsl:when>
      <xsl:when test="@notbefore and @enddate"><xsl:value-of select="eof:getLabel('dateNotbefore')"/><xsl:value-of select="@notbefore"/>, <xsl:value-of select="eof:getLabel('dateUntil')"/><xsl:value-of select="@enddate"/></xsl:when>
      <xsl:when test="@startdate">
        <xsl:value-of select="eof:getLabel('dateFrom')"/>
        <xsl:value-of select="@startdate"/>
      </xsl:when>
      <xsl:when test="@enddate">
        <xsl:value-of select="eof:getLabel('dateUntil')"/>
        <xsl:value-of select="@enddate"/>
      </xsl:when>
      <xsl:when test="@notbefore">
        <xsl:value-of select="eof:getLabel('dateNotbefore')"/>
        <xsl:value-of select="@notbefore"/>
      </xsl:when>
      <xsl:when test="@notafter">
        <xsl:value-of select="eof:getLabel('dateNotafter')"/>
        <xsl:value-of select="@notafter"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:if test="local-name() eq 'date'">
          <xsl:value-of select="./text()"/>
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="condition">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('condition')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="node()" mode="valueOnly"/>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:date" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:date[parent::mei:p]" mode="plainCommaSep">
    <xsl:apply-templates mode="#current"/>
  </xsl:template>
  <!--<xsl:template match="mei:extent" mode="plainCommaSep">
        <xsl:param name="key" select="local-name(.)"/>
        <xsl:element name="div">
            <xsl:attribute name="class">subProperty</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('subkey')"/>
                <xsl:value-of select="eof:getLabel($key)"/>
                <xsl:if test="@unit and not(@unit eq '')">
                    <xsl:element name="span"><!-\- TODO: copy to TEI -\->
                        <xsl:attribute name="class">unit</xsl:attribute>
                        (<xsl:value-of select="eof:getLabel('unit')"/>: <xsl:value-of select="@unit"/>)
                    </xsl:element>
                </xsl:if>
            </xsl:element>
            <xsl:element name="span">
                <xsl:attribute name="class" select="string('subvalue')"/>
                <xsl:apply-templates/>
            </xsl:element>
        </xsl:element>
    </xsl:template>-->
  <xsl:template match="mei:dimensions" mode="plainCommaSep">
    <xsl:param name="key" select="local-name(.)"/>
    <xsl:element name="div">
      <xsl:attribute name="class">subProperty</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class" select="string('subkey')"/>
        <xsl:value-of select="eof:getLabel($key)"/>
        <xsl:if test="@unit and not(@unit eq '')">
          <xsl:element name="span"><xsl:attribute name="class">unit</xsl:attribute>
                        (<xsl:value-of select="eof:getLabel('unit')"/>: <xsl:value-of select="@unit"/>)
                    </xsl:element>
        </xsl:if>
      </xsl:element>
      <xsl:element name="span">
        <xsl:attribute name="class" select="string('subvalue')"/>
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="exhibHist">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('exhibHist')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="node()" mode="valueOnly"/>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:extent" mode="plainCommaSep">
    <xsl:param name="key" select="local-name(.)"/>
    <xsl:element name="div">
      <xsl:attribute name="class">subProperty</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class" select="string('subkey')"/>
        <xsl:value-of select="eof:getLabel($key)"/>
        <xsl:if test="@unit and not(@unit eq '')">
          <xsl:element name="span"><!-- TODO: copy to TEI --><xsl:attribute name="class">unit</xsl:attribute>
                        (<xsl:value-of select="eof:getLabel('unit')"/>: <xsl:value-of select="@unit"/>)
                    </xsl:element>
        </xsl:if>
      </xsl:element>
      <xsl:element name="span">
        <xsl:attribute name="class" select="string('subvalue')"/>
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:element>
    <!--<xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel('extent')"/>
                <xsl:if test="@unit and not(@unit eq '')">
                    <xsl:element name="br"/>
                    (<xsl:value-of select="eof:getLabel('unit')"/>: <xsl:value-of select="@unit"/>)
                </xsl:if>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:apply-templates select="node()" mode="valueOnly"/>
                <xsl:value-of select="string(' ')"/>
            </xsl:element>
        </xsl:element>-->
  </xsl:template>
  <xsl:template match="handList">
    <xsl:for-each select="./hand">
      <xsl:element name="div">
        <xsl:attribute name="class">property</xsl:attribute>
        <xsl:element name="div">
          <xsl:attribute name="class">key</xsl:attribute>
          <xsl:value-of select="eof:getLabel('hand')"/>
          <xsl:if test="matches(local-name(id(substring-after(@resp, '#'))), '(persName)|(name)|(corpName)')">
                        : <xsl:value-of select="id(substring-after(@resp, '#'))"/>
                        <!-- TODO: Why does this select already the text within the element, but not the element itself??? -->
                    </xsl:if>
        </xsl:element>
        <xsl:element name="div">
          <xsl:attribute name="class">value</xsl:attribute>
          <xsl:apply-templates select="node()" mode="valueOnly"/>
          <xsl:value-of select="string(' ')"/>
        </xsl:element>
      </xsl:element>
    </xsl:for-each>
  </xsl:template>
  <xsl:template match="mei:handList[parent::mei:physDesc]" mode="plainCommaSep">
    <xsl:element name="div">
      <xsl:attribute name="class">subproperty</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">subkey</xsl:attribute>
        <xsl:value-of select="eof:getLabel(local-name())"/>
        <xsl:if test="matches(local-name(id(substring-after(@resp, '#'))), '(persName)|(name)|(corpName)')">
                    : <xsl:value-of select="id(substring-after(@resp, '#'))"/>
                    <!-- TODO: Why does this select already the text within the element, but not the element itself??? -->
                </xsl:if>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:element name="ul">
          <xsl:for-each select="mei:hand">
            <xsl:element name="li">
              <xsl:apply-templates mode="plainCommaSep"/>
            </xsl:element>
          </xsl:for-each>
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="inscription">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('inscription')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="node()" mode="valueOnly"/>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:physLoc">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:choose>
          <xsl:when test="@label">
            <xsl:value-of select="@label"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="eof:getLabel('physLoc')"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates mode="plainCommaSep"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:physMedium" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="plateNum">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:choose>
          <xsl:when test="@label">
            <xsl:value-of select="@label"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="eof:getLabel('plateNum')"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="node()" mode="valueOnly"/>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="provenance">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:choose>
          <xsl:when test="@label">
            <xsl:value-of select="@label"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="eof:getLabel('provenance')"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:choose>
          <xsl:when test="./parent::physDesc">
            <xsl:apply-templates select="node()" mode="valueOnly"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="node()"/>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:repository" mode="#default">
    <!-- TODO: Resolve @authURI etc. -->
    <xsl:call-template name="makeProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:repository" mode="plainCommaSep">
    <!-- TODO: Resolve @authURI etc. -->
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <!--<xsl:template match="mei:repository" mode="subProp">
    <!-\- TODO: Resolve @authURI etc. -\->
    <xsl:apply-templates>
      <xsl:with-param name="sub" select="true()"/>
    </xsl:apply-templates>
  </xsl:template>-->
  <xsl:template match="mei:termList" mode="plainCommaSep">
    <xsl:element name="ul">
      <xsl:for-each select="mei:term">
        <xsl:element name="li">
          <xsl:apply-templates select="."/>
        </xsl:element>
      </xsl:for-each>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:term[parent::mei:termList]">
    <!-- TODO: have a closer look into the contents? -->
    <xsl:value-of select="."/>
    <xsl:if test="@classcode and id(substring(@classcode, 2))">
      <xsl:text>(</xsl:text>
      <xsl:choose>
        <xsl:when test="id(substring(@classcode,2))/@authURI and id(substring(@classcode,2))/@authority">
          <xsl:element name="a">
            <xsl:attribute name="class">authURI</xsl:attribute>
            <xsl:attribute name="href">
              <xsl:value-of select="id(substring(./@classcode, 2))/@authURI"/>
            </xsl:attribute>
            <xsl:value-of select="id(substring(./@classcode, 2))/@authority"/>
          </xsl:element>
        </xsl:when>
        <xsl:when test="id(substring(@classcode,2))/@authority">
          <xsl:value-of select="id(substring(@classcode,2))/@authority"/>
        </xsl:when>
        <xsl:when test="id(substring(@classcode,2))/@label">
          <xsl:value-of select="id(substring(@classcode,2))/@label"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="id(substring(@classcode,2))/text()"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:text>)</xsl:text>
    </xsl:if>
  </xsl:template>
  <xsl:template match="mei:titlePage" mode="plainCommaSep">
    <xsl:element name="div">
      <xsl:attribute name="class">subproperty</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">subkey</xsl:attribute>
        <xsl:choose>
          <xsl:when test="@label">
            <!-- TODO make @label unit/key-like -->
            <xsl:element name="span">
              <xsl:attribute name="class">label</xsl:attribute>
              <xsl:value-of select="@label"/>
            </xsl:element>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="eof:getLabel(local-name(.))"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">subvalue</xsl:attribute>
        <xsl:apply-templates select="node()" mode="valueOnly"/>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:titlePage" mode="subProp">
    <xsl:apply-templates mode="valueOnly"/>
  </xsl:template>
  <xsl:template match="treatHist">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:choose>
          <xsl:when test="@label">
            <xsl:value-of select="@label"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="eof:getLabel('treatHist')"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="node()" mode="valueOnly"/>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="treatSched">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:choose>
          <xsl:when test="@label">
            <xsl:value-of select="@label"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="eof:getLabel('treatSched')"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="node()" mode="valueOnly"/>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:watermark" mode="plainCommaSep">
    <xsl:element name="div">
      <xsl:attribute name="class">subproperty</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">subkey</xsl:attribute>
        <xsl:choose>
          <xsl:when test="@label">
            <xsl:value-of select="@label"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="eof:getLabel('watermark')"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">subvalue</xsl:attribute>
        <xsl:apply-templates select="node()" mode="valueOnly"/>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:encodingDesc">
    <xsl:call-template name="makeSection"/>
  </xsl:template>
  <xsl:template match="mei:appInfo">
    <xsl:for-each select="mei:application">
      <xsl:element name="div">
        <xsl:call-template name="rendToProperty"/>
        <xsl:element name="div">
          <xsl:attribute name="class">value</xsl:attribute>
          <xsl:value-of select="mei:name/text()"/>
          <xsl:if test="@version and string-length(@version) gt 0">
            <xsl:value-of select="concat(' (',eof:getLabel('version'), ' ', @version,')')"/>
          </xsl:if>
          <xsl:text> </xsl:text>
          <xsl:apply-templates select="mei:ptr" mode="valueOnly"/>
          <xsl:apply-templates select="mei:p"/>
        </xsl:element>
      </xsl:element>
    </xsl:for-each>
  </xsl:template>
  <xsl:template match="samplingDecl">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('samplingDecl')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="./p" mode="valueOnly"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="projectDesc">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="eof:getLabel('projectDesc')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="./p" mode="valueOnly"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="editorialDecl">
    <xsl:for-each select="./child::*">
      <xsl:element name="div">
        <xsl:attribute name="class">property</xsl:attribute>
        <xsl:element name="div">
          <xsl:attribute name="class">key</xsl:attribute>
          <xsl:choose>
            <xsl:when test="local-name() eq 'p'">
              <xsl:value-of select="eof:getLabel('editorialDecl')"/>
            </xsl:when>
            <xsl:when test="local-name() eq 'correction'">
              <xsl:value-of select="eof:getLabel('correctionPrinciples')"/>
            </xsl:when>
            <xsl:when test="local-name() eq 'interpretation'">
              <xsl:value-of select="eof:getLabel('interpretationPrinciples')"/>
            </xsl:when>
            <xsl:when test="local-name() eq 'normalization'">
              <xsl:value-of select="eof:getLabel('normalizationPrinciples')"/>
            </xsl:when>
            <xsl:when test="local-name() eq 'segmentation'">
              <xsl:value-of select="eof:getLabel('segmentationPrinciples')"/>
            </xsl:when>
            <xsl:when test="local-name() eq 'stdVals'">
              <xsl:value-of select="eof:getLabel('stdValsPrinciples')"/>
            </xsl:when>
          </xsl:choose>
        </xsl:element>
        <xsl:element name="div">
          <xsl:attribute name="class">value</xsl:attribute>
          <xsl:choose>
            <xsl:when test="local-name() eq 'p'">
              <xsl:apply-templates select="." mode="valueOnly"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:apply-templates select="./p" mode="valueOnly"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:element>
      </xsl:element>
    </xsl:for-each>
  </xsl:template>
  <xsl:template match="p">
    <xsl:element name="div">
      <xsl:attribute name="class">property</xsl:attribute>
      <xsl:element name="div">
        <xsl:attribute name="class">key</xsl:attribute>
        <xsl:value-of select="string(' ')"/>
      </xsl:element>
      <xsl:element name="div">
        <xsl:attribute name="class">value</xsl:attribute>
        <xsl:apply-templates select="* | @* | text()" mode="valueOnly"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="p" mode="valueOnly">
    <xsl:element name="p">
      <xsl:apply-templates select="* | @* | text()" mode="valueOnly"/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="lb" mode="valueOnly">
    <xsl:element name="br"/>
  </xsl:template>
  <xsl:template match="event" mode="valueOnly">
    <xsl:element name="p">
      <xsl:apply-templates select="* | @* | text()" mode="valueOnly"/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="ref">
    <xsl:element name="a">
      <xsl:attribute name="href">
        <xsl:value-of select="@target"/>
      </xsl:attribute>
      <xsl:attribute name="target">blank_</xsl:attribute>
      <!-- TODO check for edirom internal links -->
      <xsl:apply-templates select="* | text()"/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:ref" mode="valueOnly">
    <xsl:apply-templates select="* | text()"/>
  </xsl:template>
  <xsl:template match="mei:p" mode="plainCommaSep">
    <p>
      <xsl:apply-templates mode="plainCommaSep"/>
    </p>
  </xsl:template>
  <xsl:template match="mei:rend" mode="#all">
    <xsl:variable name="style">
      <xsl:if test="@color">
        <xsl:text>color: </xsl:text>
        <xsl:choose>
          <xsl:when test="starts-with(@color, 'x')">
            <xsl:text>#</xsl:text>
            <xsl:value-of select="substring(@color, 2)"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="@color"/>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:text>;</xsl:text>
      </xsl:if>
      <xsl:if test="@fontfam | @fontname">
                font-family: '<xsl:value-of select="@fontfam | @fontname"/>';
            </xsl:if>
      <xsl:if test="@fontweight">
                font-weight: '<xsl:value-of select="@fontweight"/>';
            </xsl:if>
    </xsl:variable>
    <xsl:element name="span">
      <xsl:if test="(@rend and string-length(@rend) gt 0) or (@altrend and string-length(@altrend) gt 0)">
        <xsl:attribute name="class">
          <xsl:value-of select="@rend, @altrend" separator=" "/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="string-length($style) gt 0">
        <xsl:attribute name="style">
          <xsl:value-of select="normalize-space($style)"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:apply-templates select="@* | node()" mode="#current"/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="ptr" mode="#all">
    <xsl:text>[</xsl:text>
    <xsl:element name="a">
      <xsl:attribute name="href">
        <xsl:value-of select="@target"/>
      </xsl:attribute>
      <xsl:attribute name="target">blank_</xsl:attribute>
      <!-- TODO check for edirom internal links -->
      <xsl:choose>
        <xsl:when test="@label and string-length(@label) gt 0">
          <xsl:value-of select="@label"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>Link</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
    <xsl:text>]</xsl:text>
  </xsl:template>
  <xsl:template name="rendToClass">
    <xsl:param name="default"/>
    <xsl:attribute name="class" select="default"/>
  </xsl:template>
  <xsl:template match="music" mode="#all"/>
  <xsl:template match="mei:physDesc">
    <xsl:call-template name="makeProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:physDesc" mode="plainCommaSep">
    <xsl:for-each select="*">
      <xsl:call-template name="makeSubProperty">
        <xsl:with-param name="node" select="."/>
      </xsl:call-template>
    </xsl:for-each>
  </xsl:template>
  <xsl:template match="mei:sourceDesc">
    <xsl:element name="div">
      <xsl:call-template name="rendToSection"/>
      <xsl:choose>
        <xsl:when test="count(mei:source) gt 1">
          <!-- TODO: check implementation -->
          <xsl:element name="div">
            <xsl:attribute name="class">section</xsl:attribute>
            <xsl:element name="h1">
              <xsl:value-of select="eof:getLabel('sources')"/>
            </xsl:element>
            <xsl:for-each select="mei:source">
              <xsl:call-template name="source">
                <xsl:with-param name="labeled">
                  <xsl:value-of select="true()"/>
                </xsl:with-param>
              </xsl:call-template>
            </xsl:for-each>
          </xsl:element>
        </xsl:when>
        <xsl:when test="mei:source">
          <xsl:element name="div">
            <xsl:attribute name="class" select="string('propertyList')"/>
            <xsl:apply-templates select="mei:source">
              <xsl:with-param name="labeled">
                <xsl:value-of select="false()"/>
              </xsl:with-param>
            </xsl:apply-templates>
          </xsl:element>
        </xsl:when>
      </xsl:choose>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:revisionDesc">
    <xsl:call-template name="makeSection"/>
  </xsl:template>
  <xsl:template match="mei:itemList | mei:notesStmt">
    <xsl:element name="div">
      <xsl:call-template name="makeSection"/>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:provenance" mode="plainCommaSep">
    <xsl:call-template name="makeSubProperty">
      <xsl:with-param name="node" select="."/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="mei:eventList" mode="plainCommaSep">
    <xsl:element name="ol">
      <xsl:for-each select="mei:event">
        <xsl:element name="li">
          <xsl:apply-templates select="." mode="plainCommaSep"/>
        </xsl:element>
      </xsl:for-each>
    </xsl:element>
  </xsl:template>
  <xsl:template match="mei:event" mode="plainCommaSep">
    <xsl:apply-templates mode="plainCommaSep"/>
  </xsl:template>
</xsl:stylesheet>
